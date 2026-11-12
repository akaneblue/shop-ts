import express from 'express'
import pg from 'pg'
import cors from 'cors'
import bcrypt from 'bcrypt'
import session from 'express-session'

// express 객체 생성
const app = express();
const PORT = 8000

// cors - 요청하는 모든 주소 허용
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// 세션 설정: 로그인 정보를 서버 메모리에 저장하고, 브라우저에는 세션 ID 쿠키만 보냅니다.
app.use(session({
  secret: "space-shop-secret",   // 세션 ID 쿠키를 서명하는 비밀 키
  resave: false,                 // 바뀐 것이 없으면 다시 저장하지 않음
  saveUninitialized: false,      // 로그인하기 전에는 세션을 만들지 않음
  cookie: {
    httpOnly: true,              // 자바스크립트로 쿠키를 읽을 수 없게 (XSS 방어)
    maxAge: 1000 * 60 * 60       // 1시간 뒤 만료
  }
}));

// 본문 요청 파싱
app.use(express.json());

// 로그인했는지 확인하는 미들웨어
const requireLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).send("로그인이 필요합니다.");
  }
  next();   // 다음 단계(라우터)로 넘어감
};

// 관리자인지 확인하는 미들웨어
const requireAdmin = (req, res, next) => {
  if (req.session.user?.role !== "admin") {
    return res.status(403).send("관리자만 사용할 수 있습니다.");
  }
  next();
};


// DB 연결
const db = new pg.Client({
    host: "localhost",
    user: "jsuser",
    password: "1234",
    database: "tsdb"
})

try {
    await db.connect();
    console.log("DB 연결 성공!");
    
} catch (error) {
    console.error("DB연결 중 오류 발생", error.message);
}

// 기본 라우터
app.get("/", (req, res) => {
    res.send("<h1>쇼핑몰 서버 API</h1>")
})

// 상품 목록 조회
app.get("/api/products", async(req, res) => {
    const sql = "SELECT * FROM products";
    try {
        const result = await db.query(sql);    
        res.json(result.rows);
    } catch (error) {
        console.error("상품 목록 조회 중 오류 발생", error);
        res.status(500).send("상품 목록 조회 중 오류 발생", error);
    }
})

// 상품 단건조회
app.get("/api/products/:id", async(req, res) => {
    const pid = req.params.id;
    const sql = `SELECT * FROM products WHERE id = $1`;
    try {
        const result = await db.query(sql,[pid]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error("상품 조회 중 오류 발생", error);
        res.status(500).send("상품 조회 중 오류 발생");
    }
})

// 상품 등록
app.post("/api/products", requireAdmin, async(req,res) => {
    const {pName, category, price, description, image} = req.body;
    const sql = "INSERT INTO products(p_name, category, price, description, image) VALUES($1, $2, $3, $4, $5) "
    try {
        await db.query(sql, [pName, category, price, description, image ?? null]);
        res.send("상품 등록 완료");
    } catch (error) {
        console.log("상품 등록 중 오류 발생", error);
        res.status(500).send("상품 등록 중 오류 발생");
        
    }
})

// 상품 수정
app.put("/api/products/:id", requireAdmin, async(req,res) => {
    const {pName, category, price, description, image} = req.body;
    const pid = req.params.id;
    const sql = "UPDATE products SET p_name = $1, category = $2, price = $3, description = $4, image = $5 WHERE id = $6"
    try {
        await db.query(sql, [pName, category, price, description, image ?? null, pid]);
        res.send("상품 수정 완료");
    } catch (error) {
        console.log("상품 수정 중 오류 발생", error);
        res.status(500).send("상품 수정 중 오류 발생");
        
    }
})

// 상품 삭제
app.delete("/api/products/:id", requireAdmin, async(req, res) => {
    const pid = req.params.id;
    const sql = `DELETE FROM products WHERE id = $1`;
    try {
        await db.query(sql,[pid]);
        res.send("상품 삭제 완료")
    } catch (error) {
        console.error("상품 삭제 중 오류 발생", error);
        res.status(500).send("상품 삭제 중 오류 발생");
    }
})

// 회원 목록
app.get("/api/users", async(req, res) => {
    const sql = "SELECT * FROM users";
    try {
        const result = await db.query(sql);
        res.send(result.rows);
    } catch (error) {
        console.log("회원 조회 오류", error);
        res.status(500).send("회원 조회 오류");
        
    }
})

// 로그인
// app.post("/api/users/login", async(req, res) => {
//     const {username, password} = req.body;
//     const sql = "SELECT * FROM users WHERE username = $1 AND password = $2";
//     try {
//         const result = await db.query(sql,[username, password]);
//         if(result.rows.length === 0){
//             return res.status(401).send("아이디 또는 비밀번호가 일치하지 않습니다.")
//         }
//         res.send({message: "로그인 성공", user: result.rows[0]});
//     } catch (error) {
//         console.log("로그인 오류", error);
//         res.status(500).send("로그인 오류");
        
//     }
// })

// 로그인 - 비밀번호 암호화
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;
  const sql = "SELECT * FROM users WHERE username = $1";
  try {
    const result = await db.query(sql, [username]);
    const user = result.rows[0];
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
    const { password: _, ...userInfo } = user;
    req.session.user = userInfo;   // 세션에 로그인 정보 저장
    res.json({ message: "로그인 성공", user: userInfo });
  } catch (err) {
    console.log("회원 로그인 오류!", err);
    res.status(500).send("로그인 중 오류가 발생했습니다.");
  }
});

// 로그인 확인: 새로고침해도 세션에 남아 있는 회원 정보를 돌려줍니다.
app.get("/api/users/me", requireLogin, (req, res) => {
  res.json(req.session.user);
});

app.post("/api/users/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.send("로그아웃 완료");
  });
});

// 회원가입
app.post("/api/users", async(req, res) => {
    const {username, password, name, email} = req.body;
    const sql = "INSERT INTO users (username, password, name, email) VALUES ($1, $2, $3, $4)";
    try {
        // 비밀번호 암호화
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.query(sql,[username, hashedPassword, name, email]);
        res.send("회원가입 완료")
    } catch (error) {
        console.log("회원 가입 오류", error);
        res.status(500).send("회원 가입 오류");
    }
})

// 회원 정보 수정
app.put("/api/users/:id", requireLogin, async (req, res) => {
  // 세션의 회원 번호와 주소의 번호가 다르면 막음 (본인만 수정)
  if (req.session.user.id !== Number(req.params.id)) {
    return res.status(403).send("본인 정보만 수정할 수 있습니다.");
  }
  const uid = req.params.id;
  const { name, email } = req.body;
  // RETURNING: 바꾼 뒤의 회원 정보를 바로 돌려받습니다. (password는 빼고)
  const sql = "UPDATE users SET name = $1, email = $2 WHERE id = $3 "
        + "RETURNING id, username, name, email, role, created_at";
  try {
    const result = await db.query(sql, [name, email, uid]);
    if (result.rows.length === 0) {
      return res.status(404).send("회원을 찾을 수 없습니다.");
    }
    req.session.user = result.rows[0];   // 세션의 회원 정보도 새 값으로
    res.json(result.rows[0]);
  } catch (err) {
    // 23505: UNIQUE 위반 (다른 회원이 쓰는 이메일)
    if (err.code === "23505") {
      return res.status(409).send("이미 사용 중인 이메일입니다.");
    }
    console.log("회원 수정 오류!", err);
    res.status(500).send("회원 정보 수정 중 오류가 발생했습니다.");
  }
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버 실행중... http://localhost:${PORT}`);
})
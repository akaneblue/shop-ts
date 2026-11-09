import express from 'express'
import pg from 'pg'

// express 객체 생성
const app = express();
const PORT = 8000

// 본문 요청 파싱
app.use(express.json());

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
        res.send("상품 목록 조회 중 오류 발생", error);
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
        res.send("상품 조회 중 오류 발생");
    }
})

// 상품 등록
app.post("/api/products", async(req,res) => {
    const {pName, category, price, description, image} = req.body;
    const sql = "INSERT INTO products(p_name, category, price, description, image) VALUES($1, $2, $3, $4, $5) "
    try {
        await db.query(sql, [pName, category, price, description, image ?? null]);
        res.send("상품 등록 완료");
    } catch (error) {
        console.log("상품 등록 중 오류 발생", error);
        res.send("상품 등록 중 오류 발생");
        
    }
})

// 상품 수정
app.put("/api/products/:id", async(req,res) => {
    const {pName, category, price, description, image} = req.body;
    const pid = req.params.id;
    const sql = "UPDATE products SET p_name = $1, category = $2, price = $3, description = $4, image = $5 WHERE id = $6"
    try {
        await db.query(sql, [pName, category, price, description, image ?? null, pid]);
        res.send("상품 수정 완료");
    } catch (error) {
        console.log("상품 수정 중 오류 발생", error);
        res.send("상품 수정 중 오류 발생");
        
    }
})

// 상품 삭제
app.delete("/api/products/:id", async(req, res) => {
    const pid = req.params.id;
    const sql = `DELETE FROM products WHERE id = $1`;
    try {
        await db.query(sql,[pid]);
        res.send("상품 삭제 완료")
    } catch (error) {
        console.error("상품 삭제 중 오류 발생", error);
        res.send("상품 삭제 중 오류 발생");
    }
})

// 서버 실행
app.listen(PORT, () => {
    console.log(`서버 실행중... http://localhost:${PORT}`);
})
// 서버와 연결
import api from "./api";
import type { Category, NewProduct, Product } from "../types/product";

// DB에서 오는 데이터 타입 정의
interface ProductRow{
    id: number;
    p_name: string;
    category: Category;
    price: number;
    description: string;
    image: string | null;
}

// db 데이터 -> 화면 보여주기
const toProduct = (row: ProductRow) : Product =>({
    id: row.id,
    pName: row.p_name,
    category: row.category,
    price: row.price,
    description: row.description,
    image: row.image ?? undefined
})

// 상품 목록 조회
export const getProducts = async() => {
    const response = await api.get<ProductRow[]>("/products");
    return response.data.map(toProduct);
}

// 상품 등록(Form 입력값을 DB로 전송)
export const createProduct = async (product: NewProduct) => {
    await api.post("/products", {
        pName: product.pName,
        category: product.category,
        price: product.price,
        description: product.description,
        image: product.image
    });
}
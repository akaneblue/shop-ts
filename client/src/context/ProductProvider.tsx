import { useEffect, useState } from "react"
import { ProductContext } from "./ProductContext"
import type {NewProduct, Product} from "../types/product"
import { getProducts, createProduct } from "../api/Product"

// ProductProvider는 저장소(repository) 역할
const ProductProvider = ({children} : {children: React.ReactNode}) => {
    const [products, setProducts] = useState<Product[]>([]);

    // 상품 목록 불러오기(렌더링시 한번만)
    useEffect(() => {
        getProducts()
            .then(setProducts)
            .catch(err => console.log("상품 목록 조회 오류", err));
    },[])

    // 상품 추가 함수
    const addProduct = async(newProduct: NewProduct) => {
        await createProduct(newProduct);    //db에 상품 등록
        setProducts(await getProducts());   //등록된 상품을 배열에 저장
    }

    return(
        <ProductContext.Provider value={{products, addProduct}}>
            {children}
        </ProductContext.Provider>
    )
}

export default ProductProvider
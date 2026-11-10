import type { ProductForm } from "../types/product";
import { useProduct } from "../context/ProductContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 초기 폼 데이터
const initialForm: ProductForm = {
  pName: "",
  category: "마우스",
  price: 0,
  description: "",
  image: "",  // 처음에는 선택 안 함
};

const AddProduct = () => {
  const {addProduct} = useProduct();
  const [form, setForm] = useState<ProductForm>(initialForm);
  const [error, setError] = useState<string | null>(null);

  // 폼 데이터 구조 분해 할당
  const {pName, category, price, description, image} = form;
  const navigate = useNavigate();

  // 입력값 변경 핸들러
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: value
    });
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // 유효성 검사
    if(!pName.trim()){
      setError("상품명을 입력해주세요.");
      return;
    }
    if(!price || price <= 0){
      setError("가격을 올바르게 입력해주세요.");
      return;
    }
    if(!description.trim()){
      setError("설명을 입력해주세요.");
      return;
    }

    // 상품 추가
    try {
      // 서버에 저장이 끝날 때까지 기다립니다.
      await addProduct({
        pName, 
        category, 
        price: Number(price), 
        description,
        image: image || undefined  // "" (선택 안 함)이면 undefined
      });
      alert("상품이 등록되었습니다.");
      // 상품 목록 페이지로 이동
      navigate('/');
    } catch {
      setError("상품 등록 중 오류가 발생했습니다.");
    }
  }

  // 폼 초기화 핸들러
  const handleCancel = () => {
    setForm(initialForm);
    setError(null);
  };

  return (
    <div className="product-add"> 
      <h2>상품 등록</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="pName">상품명:</label>
          <input
            type="text"
            id="pName"
            name="pName"
            value={pName}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="category">카테고리:</label>
          <select
            id="category"
            name="category"
            value={category}
            onChange={handleChange}
          >
            <option value="마우스">마우스</option>
            <option value="키보드">키보드</option>
            <option value="모니터">모니터</option>
            <option value="주변기기">주변기기</option>
          </select>
        </div>
        <div>
          <label htmlFor="price">가격:</label>
          <input
            type="number"
            id="price"
            name="price"
            value={price}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="description">설명:</label>
          <textarea
            id="description"
            name="description"
            value={description}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="image">이미지:</label>
          <select
            id="image"
            name="image"
            value={image}
            onChange={handleChange}
          >
            <option value="">선택 안 함</option>
            <option value="/images/mouse.png">마우스</option>
            <option value="/images/keyboard.png">키보드</option>
            <option value="/images/monitor.png">모니터</option>
            <option value="/images/usb-hub.png">USB-C 허브</option>
            <option value="/images/webcam.png">웹캠</option>
          </select>
        </div>
        {error && <p className="product-add_error">{error}</p>}
        <div className="product-add_buttons">
          <button type="submit">등록</button>
          <button type="button" onClick={handleCancel}>취소</button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
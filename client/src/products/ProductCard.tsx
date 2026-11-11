
import { Link, useNavigate } from "react-router-dom";
import type {Product} from "../types/product"
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
const NO_IMAGE = "/images/no-image.png"

const ProductCard = ({product}: {product: Product}) => {
    const { addToCart } = useCart();
    const { currentUser } = useUser();
    const navigate = useNavigate();
    
    return(
        <div className="product-card"> 
            <Link to ={`/product/${product.id}`}>
                <img className="product-card_image" src={product.image ?? NO_IMAGE} alt={product.pName} />
            </Link>
            <span>{product.category}</span>
            <h3>
              <Link to={`/product/${product.id}`}>{product.pName}</Link>
            </h3>
            <p>{product.price.toLocaleString()}원</p>
            <button onClick={() => {
                if(!currentUser){
                    alert("로그인 후 이용해주세요.")
                    navigate("/signin");
                    return;
                }
                addToCart(product.id, 1);
                alert("상품이 장바구니에 담겼습니다.")
            }}>담기</button>
        </div>
    )
}

export default ProductCard;
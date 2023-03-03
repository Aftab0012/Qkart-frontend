import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

// const data =
// {
// "name":"Tan Leatherette Weekender Duffle",
// "category":"Fashion",
// "cost":150,
// "rating":4,
// "image":"https://crio-directus-assets.s3.ap-south-1.amazonaws.com/ff071a1c-1099-48f9-9b03-f858ccc53832.png",
// "_id":"PmInA797xJhMIPti"
// };

const ProductCard = ({ product, items, handleAddToCart }) => {
  const token = localStorage.getItem("token");
  const cartQuantity = (items, product) => {
    let quantity = 1;
    items.forEach((element) => {
      if (product._id === element.productId) {
        console.log(element.qty);
        quantity = quantity + 1;
      }
    });
    console.log(quantity);
    return quantity;
  };
  return (
    <Card>
      <Card md={1} lg={1} xl={1} className="card">
        <CardMedia
          component="img"
          height="250"
          image={product.image}
          alt={product.name}
        />

        <CardContent>
          <Typography variant="h5" fullWidth gutterBottom component="div">
            {product.name}
          </Typography>
          <Typography
            variant="h5"
            paddingY="0.5rem"
            fontWeight="700"
            fullWidth
            gutterBottom
          >
            ${product.cost}
          </Typography>
          <Rating name="read-only" value={product.rating} readOnly fullWidth />
        </CardContent>

        <CardActions className="card-actions">
          <Button
            className="card-button"
            name="add to cart"
            variant="contained"
            startIcon={<AddShoppingCartOutlined />}
            fullWidth
            component="div"
            value={product._id}
            onClick={(e) => {
              let qty = cartQuantity(items, product);
              handleAddToCart(
                token,
                items,
                product,
                product._id,
                qty,
                (Option = { preventDuplicate: true })
              );
            }}
          >
            Add to cart
          </Button>
        </CardActions>
      </Card>
    </Card>
  );
};

export default ProductCard;

import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
// Definition of Data Structures used
/**
 * @typedef {Object} Product - Data on product available to buy
 * 
 * @property {string} name - The name or title of the product


/**
 * @typedef {Object} CartItem -  - Data on product added to cart
 * 
 * @property {string} name - The name or title of the product in cart
 * @property {string} qty - The quantity of product added to cart
 * @property {string} category - The category that the product belongs to
 * @property {number} cost - The price to buy the product
 * @property {number} rating - The aggregate rating of the product (integer out of five)
 * @property {string} image - Contains URL for the product image
 * @property {string} _id - Unique ID for the product
 */

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [load, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [debounceTimeout, setDebounceTimeOut] = useState("");
  const [fetchCartItem, setFetchCart] = useState([]);
  const [items, setItems] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    performAPICall();
  }, []);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      let userToken = localStorage.getItem("token");

      fetchCart(userToken)
        .then((carts) => {
          return generateCartItemsFrom(carts, products);
        })
        .then((res) => {
          setFetchCart(res);
        });
    }
  }, [products]);

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Fetch products data and store it
  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const token = localStorage.getItem("token");

  const performAPICall = async () => {
    setLoading(true);
    try {
      let response = await axios.get(`${config.endpoint}/products`);
      //  console.log(response);

      setLoading(false);
      setProducts(response.data);
      setAllProducts(response.data);
      console.log(response.data);
      return response.data;
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.status === 500) {
        enqueueSnackbar(error.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch products.Check that the backend is running, reachable and returns valid JSON.",
          { variant: "error" }
        );
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Implement search logic
  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */

   const performSearch = async (text) => {
    try {
      const response = await axios.get(
        `${config.endpoint}/products/search?value=${text}`
      );
      const productsReceived = response.data;
      console.log("API CALL MADE", response.data);
      setProducts(productsReceived);
    } catch (error) {
      if (error.response) {
        if (error.response.status === 404) {
          setProducts([]);
        }
        if (error.response.status === 500) {
          enqueueSnackbar(error.response.message, { variant: "error" });
          setProducts(products);
        }
      } else {
        enqueueSnackbar("Backend not Running", { variant: "error" });
      }
    }
  };

  // TODO: CRIO_TASK_MODULE_PRODUCTS - Optimise API calls with debounce search implementation
  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
   const debounceSearch = (event, debounceTimeout) => {
    const value = event.target.value;
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const timeOut = setTimeout(() => {
      performSearch(value);
    }, 500);

    setDebounceTimeOut(timeOut);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      const response = await axios.get(`${config.endpoint}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      //  console.log(response.data)

      setItems(response.data);

      return response.data;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  //    if(persons.some(person => person.name === "Peter")){
  //     alert("Object found inside the array.");
  // } else{
  //     alert("Object not found.");
  const isItemInCart = (items, productId) => {
    if (items.some((items) => items.productId === productId)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    token,
    items,
    productData,
    productId,
    qty,
    option = { preventDuplicate: false }
  ) => {
    if (!token) {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
      });
      return;
    }
    console.log(token);
    console.log(items);
    console.log(products);
    console.log(productId);
    console.log(qty);
    if (option.preventDuplicate && isItemInCart(items, productId)) {
      enqueueSnackbar("Item already in cart", { variant: "warning" });
      return;
    }
    try {
      const response = await axios.post(
        `${config.endpoint}/cart`,
        { productId, qty },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data)
      // updateCartItems(response.data , products)
      console.log(response.data);
      const cartItems = generateCartItemsFrom(response.data, products);
      setFetchCart(cartItems);
      console.log(cartItems);
    } catch (e) {
      if (e.response) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
      } else {
        enqueueSnackbar(
          "Could not fetch products. Check that the backend is running , reachable and returns valid JSON",
          { variant: "error" }
        );
      }
    }
  };
  // const updateCartItems = (cartData , products)=>{
  //   const cartItems = generateCartItemsFrom(cartData , products);
  //   setFetchCart(cartItems);
  //   console.log(cartItems)
  // }
  // console.log(fetchCartItem)
  // console.log(products)
  // console.log(token)
  // console.log(items)
  return (
    <div>
      <Box>
        <Header>
          <TextField
            className="search-desktop"
            size="small"
            InputProps={{
              className: "search",
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for Items/Categories"
            name="search"
            onChange={(event) => debounceSearch(event, debounceTimeout)}
          />
        </Header>
        <TextField
          className="search-mobile"
          size="small"
          InputProps={{
            className: "search",
            endAdornment: (
              <InputAdornment position="end">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}
          placeholder="Search for items/categories"
          name="search"
          onChange={(e) => debounceSearch(e, 1000)}
        />
      </Box>

      <Grid container xs={12}>
        <Grid
          item
          className="product-grid"
          spacing={2}
          md={token && products.length ? 9 : 12}
        >
          <Box className="hero">
            <p className="hero-heading">
              India’s <span className="hero-highlight">FASTEST DELIVERY</span>{" "}
              to your door step
            </p>
          </Box>
          {load ? (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <CircularProgress />
              Loading Products...
            </Box>
          ) : (
            <Grid container marginY="1rem" paddingX="1rem" spacing={2}>
              {products.length > 0 ? (
                products.map((products) => (
                  <Grid item xs={6} md={3} key={products._id}>
                    {/* <ProductCard product = {products} items = {fetchCartItem} handleAddToCart ={async ()=>{
                    await addToCart(
                      token,
                      fetchCartItem,
                      products,
                      fetchCartItem._id,
                      fetchCartI

                    )
                  }} /> */}
                    <ProductCard
                      product={products}
                      handleAddToCart={addToCart}
                      items={items}
                    />
                  </Grid>
                ))
              ) : (
                <Box className="loading">
                  <SentimentDissatisfied color="action" />
                  <h3 style={{ color: "636363" }}>No Products Found</h3>
                </Box>
              )}
            </Grid>
          )}
        </Grid>
        {token && (
          <Grid item xs={12} md={3} bgcolor="#E9F5E1" paddingX="1rem">
            <Cart
              hasCheckoutButton
              items={fetchCartItem}
              products={products}
              handleQuantity={addToCart}
            />
          </Grid>
        )}
      </Grid>

      <Footer />
    </div>
  );
};

export default Products;

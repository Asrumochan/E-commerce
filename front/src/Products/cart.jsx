import Axios from 'axios';
import React, { useEffect, useState,useReducer } from 'react'

const Cart = ({selectedProductId=[]}) => {
  const [products,setProducts]=useState([])
  // const [state,dispatch]=useReducer(reducer,initialState)
  const increaseQuantity=(id)=>{
      let selectedProduct=products.find((prod)=>{
        return prod._id===id ;
      })
      const updatedProducts = products.map((prod) => {
        if (prod._id === id) {
            return { ...prod, qty: prod.qty + 1 }; 
        }
        return prod; 
    });
    setProducts(updatedProducts);
  }
  const decreaseQuantity=(id)=>{
      let selectedProduct=products.find((prod)=>{
        return prod._id===id ;
      })
      const updatedProducts = products.map((prod) => {
        if (prod._id === id) {
            return { ...prod, qty: prod.qty - 1 }; 
        }
        return prod; 
    });
    setProducts(updatedProducts);
  }
  const getData=(id)=>{
    Axios.get(`http://127.0.0.1:5000/api/products/${id}`)
    .then((res)=>{
      setProducts((prev)=>[...prev,res.data])
     })
    .catch()
  }
  useEffect(()=>{
    selectedProductId.forEach(element => {
      getData(element)
    });
  },[]);
  const total = products.reduce((acc, product) => {
    return acc + product.price * product.qty;
  },0);
  const imgHandler=(evt)=>{
    evt.target.src="https://media.istockphoto.com/id/1318420912/vector/mock-up-screen-phone.jpg?s=612x612&w=0&k=20&c=z7RTcOE_vnT9eRcSEQhw0EVVRDb9JdDPaApfyO5nFxM="
   }
  return (
    <div className='container mt-5'>
      <div className="row">
        <div className="col-10">
        <table className='table'>
            <thead>
              <tr>
                <th>Name</th>
                <th>Image</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total_Price</th>
              </tr>
            </thead>
            <tbody>
              {
                products.map((product)=>{
                  let flag;
                  if(product.qty===1 ){
                     flag = true;
                  }
                  else{
                    flag=false;
                  }
                  return <tr key={product._id}>
                          <td>{product.name}</td>
                          <td><img src={product.image} onError={imgHandler} height='50px' alt="" /></td>
                          <td>{product.price}</td>
                          <td><button className='btn btn-secondary' disabled={flag} onClick={()=>decreaseQuantity(product._id)}>-</button> {product.qty} <button className='btn btn-secondary' onClick={()=>increaseQuantity(product._id)}>+</button> </td>
                          <td>{product.price*product.qty}</td>
                  </tr>
                })
              }
            </tbody>
        </table>
        </div>
      </div>
        <h5>Total  Price: ₹{total}</h5>
        <h1 className='btn btn-info'>Place Order</h1>  
    </div>
  )
}

export default Cart

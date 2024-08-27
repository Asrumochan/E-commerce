import  Axios  from 'axios';
import React, { useEffect, useState } from 'react'
import {useNavigate} from 'react-router-dom'

const Products = ({addId}) => {
  let navigate=useNavigate()
   const [products,setProducts]=useState([]);

   useEffect(()=>{
    Axios.get("http://127.0.0.1:5000/api/products")
    .then((res)=>{
      setProducts(res.data)
    })
    .catch( )
   },[])
   const imgHandler=(evt)=>{
    evt.target.src="https://media.istockphoto.com/id/1318420912/vector/mock-up-screen-phone.jpg?s=612x612&w=0&k=20&c=z7RTcOE_vnT9eRcSEQhw0EVVRDb9JdDPaApfyO5nFxM="
   }
   const addCart=(id)=>{
          addId(id)
   }
  return (
    <div className='mt-5'>
         <div className="row">
         {
          products.map((product)=>{
            return <div className="col-md-3 mt-3">
                 <div className="card">
                  <div className="card-header">
                    <img src={product.image} onError={imgHandler} style={{height:"200px"}} />
                  </div>
                  <div className="card-body">
                    <h5>{'Name : '+ product.name}</h5>
                    <h5>{'Qty : '+product.qty}</h5>
                    <h5>{'Price : '+product.price}</h5>
                    <h5>{'Info: '+product.info}</h5>
                    <btn className='btn btn-success' onClick={()=>addCart(product._id)}>Add to Cart</btn>
                  </div>
                 </div>
            </div>
          })
         }
         </div>
    </div>
  )
}

export default Products

import Axios  from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [products,setProducts]=useState([]);
  const navigate=useNavigate();
  useEffect(()=>{
    Axios.get("http://127.0.0.1:5000/api/products")
    .then((resp)=>{
      setProducts(resp.data)
    })
    .catch((err)=>{
      console.log(err)
    })
  },[products])
  const deleteProd=(id)=>{
      Axios.delete(`http://127.0.0.1:5000/api/products/${id}`)
      .then(()=>{console.log("product deleted")})
      .catch(()=>{})
  }
  const updateProd=(id)=>{
    console.log(id)
        navigate('/update',{state:id})
  }
  return (
    <div className='mt-5'>
      <h1>Admin</h1>
      <div className="container">
        <div className="row">
          <div className="col">
            <table className='table table-striped'>
              <thead>
                <tr>
                  <td>Name</td>
                  <td>Image</td>
                  <td>Price</td>
                  <td>Quantity</td>
                  <td>Actions</td>
                </tr>
              </thead>
              <tbody>
                  {
                    products.map((product)=>{
                      return <tr key={product._id}>
                        <td>{product.name}</td>
                        <td><img src={product.image} height={"100px"} onError={(e)=>{e.target.src="https://media.istockphoto.com/id/1318420912/vector/mock-up-screen-phone.jpg?s=612x612&w=0&k=20&c=z7RTcOE_vnT9eRcSEQhw0EVVRDb9JdDPaApfyO5nFxM="}}/></td>
                        <td>{product.price}</td>
                        <td>{product.qty}</td>
                        <td><button className='btn btn-warning ' onClick={()=>updateProd(product._id)} >Update</button> <button className='btn btn-danger ' onClick={()=>deleteProd(product._id)}>Delete</button></td>
                      </tr>
                    })
                  }
              </tbody>

            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Admin

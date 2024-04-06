import Axios from 'axios';
import React, { useEffect, useState,useRef} from 'react'
import {useNavigate,useLocation} from 'react-router-dom';

const UpdateProduct = () => {
  let location=useLocation();
  let navigate=useNavigate();
  let id=location.state;
  const [product,setProduct]=useState({})
  const [imageString, setImageString] = useState('');
  const formRef = useRef(null);

  useEffect(()=>{
    Axios.get( `http://127.0.0.1:5000/api/products/${id}`)
    .then((resp)=>{
      setProduct(resp.data)
    })
  },[])
  const updateHandler=(evt)=>{
    setProduct({...product,[evt.target.name]:evt.target.value})
}
const handleImageChange = (event) => { // 5MB (adjust as needed)
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = (event) => {
    const imageData = event.target.result;
    setImageString(imageData);
    console.log(imageString)
    setProduct({...product,image:imageString})
  };
  
};
const addProduct=(evt)=>{
  evt.preventDefault();
  Axios.put(`http://127.0.0.1:5000/api/products/${id}`,product)
  .then((resp)=>{
    console.log("product updated")
    navigate('/admin')
  })
  .catch((err)=>{
    console.log(err)
  })
  
}
  return (
    <div className="container mt-5">

    <div className="row">
      <div className="col-10">
        <div className="card">
          <div className="card-header">
            <h1>Update Product</h1>
      <pre>{JSON.stringify(product)}</pre>
          </div>
          <div className="card-body ">
            <form className='form' onSubmit={addProduct} ref={formRef} >
              <div className="form-group mt-4 border border-primary">
                <label>Enter Name</label>
              <input className='form-control' required type="text" value={product.name}  onChange={updateHandler} name="name"/>
              </div>
              <div className="form-group mt-4 border border-primary">
              <label>Upload Image</label>
              <input className='form-control'  type="file"   onChange={handleImageChange} name="image"/>
              </div>
              <div className="form-group mt-4 border border-primary">
              <label>Enter Price</label>
              <input className='form-control' required type="number" value={product.price} onChange={updateHandler} name="price" />
              </div>
              <div className="form-group mt-4 border border-primary">
              <label>Enter Quantity</label>
              <input className='form-control' required type="number" value={product.qty} onChange={updateHandler} name="qty"/>
              </div>
              <div className="form-group mt-4 border border-primary">
              <label>Enter Info</label>
              <input className='form-control' required type="text" value={product.info} onChange={updateHandler} name="info"/>
              </div>
              <div className="form-group mt-4">
                <input className='form-control btn btn-primary' type="submit" value='Add Product' />
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export default UpdateProduct

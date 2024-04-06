import React, {useState } from 'react'
import {Link,BrowserRouter as Router, Route,Routes} from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import Products from './Products/Products'
import Admin from './Products/Admin'
import CreateProduct from './Products/CreateProduct'
import UpdateProduct from './Products/UpdateProduct'
import Cart from './Products/cart'

const App = () => {
 const [selectedProductId,setSelectedProductId]=useState([])
 const addId = (id) => {
  if (!selectedProductId.includes(id)) {
    setSelectedProductId((prevIds) => [...prevIds, id]);
  }
};
 return <>
  <Router>
        <nav className='navbar navbar-dark bg-dark navbar-expand-lg fixed-top'>
        <Link to="/" className='navbar-brand'>E-Commerce</Link>
        <div className='ml-auto'>
          <ul className='navbar-nav'>
            <li><Link  className='nav-link' to="/products">Products</Link></li>
            <li><Link className='nav-link' to="/create">New Product</Link></li>
            <li><Link  className='nav-link' to="/admin">Admin</Link></li>
          </ul>
        </div>
        <Link to="/cart" className="nav-link">
          <FontAwesomeIcon icon={faShoppingCart} style={{ color: 'white' }} />
            </Link>
        <p style={{ color: 'white', marginLeft: '5px' }}>
            {selectedProductId.length}
          </p>
        </nav>
        <Routes>
        <Route path="/products" element={<Products addId={addId}/>} />
        <Route path="/admin" element={<Admin/>} />
        <Route path="/create" element={<CreateProduct/>} />
        <Route path="/update" element={<UpdateProduct/>} />
        <Route path="/cart" element={<Cart selectedProductId={selectedProductId}/>} />
        </Routes>
  </Router>
       </>
}

export default App
import React, { useEffect, useState } from "react";
import axios from "axios";

// ✅ Dynamic URL logic
const API_BASE_URL = window.location.hostname === "localhost" 
  ? "http://localhost:5000" 
  : "https://dine-tech-iyqs.vercel.app";

function KitchenSection(){

const [updates,setUpdates] = useState([]);

useEffect(()=>{
// ✅ Replaced localhost
axios.get(`${API_BASE_URL}/api/admin/kitchen-updates`)
.then(res => setUpdates(res.data));

},[]);

return(

<div>

<h2 className="text-xl font-bold mb-4">
Kitchen Updates
</h2>

{updates.map(u => (

<div
key={u._id}
className="bg-white p-4 rounded shadow mb-4"
>

<h3>{u.ingredient}</h3>

<p>{u.message}</p>

<small>
{new Date(u.createdAt).toLocaleString()}
</small>

</div>

))}

</div>

);

}

export default KitchenSection;
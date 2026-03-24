
import React, { useEffect, useState } from "react";
import axios from "axios";

function KitchenSection(){

const [updates,setUpdates] = useState([]);

useEffect(()=>{

axios.get("http://localhost:5000/api/admin/kitchen-updates")
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

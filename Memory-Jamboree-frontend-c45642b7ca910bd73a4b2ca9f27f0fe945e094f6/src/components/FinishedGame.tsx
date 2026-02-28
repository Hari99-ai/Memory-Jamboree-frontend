import { Link, useParams } from "react-router-dom"
import Hero from "../Home/homeComponents/Hero"



export default function FinishedGame() {
  const {time} = useParams();
  
  return (
    <div className="flex">
        <Link to={'/'}>
            <div className="p-2 bg-[#e3a77e]"><Hero/></div>
        </Link>
        <span>{time} words</span>
        <div>
            <p>On the next screen, You need to memorise the words in order in each column.</p>
            <p>On the Recall Sheet, You need to recall the words in order in each column</p>
        </div>
        <button className="p-2 bg-[#e3a77e] rounded-md">start</button>
    </div>
  )
}
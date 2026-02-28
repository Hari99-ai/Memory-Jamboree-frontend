import { Link } from "react-router-dom";


type Time = {
    time: string[]
}

type GameCardProps = {
    image: string;
    title: string;
    time: Time[] 
}

const GameCard = ({image , title , time}: GameCardProps) => {

  const gameSlug = title.toLowerCase().replace(/\s/g, "-");

  
  return (
    <div className="p-2 h-[300px] shadow-lg border-4 rounded-sm">
        <div className="flex flex-col justify-center items-center p-5">
            <img src={image} alt="game_img" className="h-20" />
            <p className="text-3xl text-gray-900 font-semibold mt-6">{title}</p>
            <ul className="flex gap-3 mt-10">
                {time.map((ele, index) =>
                    ele.time.map((t, i) => (
                    <li key={`${index}-${i}`}>
                       <Link to={`/dashboard/practiceTests/practice/${gameSlug}/${t}`}>
  <button className="p-2 bg-blue-500 text-white rounded">{t} min</button>
</Link>

                    </li>
                    ))
                )}
                </ul>
        </div>
    </div>
  )
}

export default GameCard
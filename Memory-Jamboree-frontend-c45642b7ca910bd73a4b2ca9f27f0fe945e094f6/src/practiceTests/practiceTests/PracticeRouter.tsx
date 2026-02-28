import { lazy, Suspense } from "react";
import { useParams } from "react-router-dom";

const WordsGame = lazy(() => import("../../Games/Words/WordsGame"));
const NumbersGame = lazy(() => import("../../Games/Numbers/NumbersGame"));
const ImageGame = lazy(() => import("../../Games/Image/ImageGame"));

type Props = {
  userConfig: Record<string, any>;
};

export default function PracticeRouter({ userConfig }: Props) {
  const { game, time } = useParams();

  if (!game || !time) return <div>Missing game or time</div>;

  const normalizedGame = game.toLowerCase();

  let GameComponent: any;

  switch (normalizedGame) {
    case "words":
      GameComponent = WordsGame;
      break;
    case "numbers":
      GameComponent = NumbersGame;
      break;
    case "image":
      GameComponent = ImageGame;
      break;
    default:
      return <div>Invalid game: {game}</div>;
  }

  return (
    <Suspense fallback={<div>Loading Game...</div>}>
      <GameComponent
        time={parseInt(time)}
        instruction={userConfig}
      />
    </Suspense>
  );
}

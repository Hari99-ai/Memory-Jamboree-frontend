import { Card, CardContent, CardFooter, CardTitle } from "../../ui/card"
import { Button } from "../../ui/button"

export function MyEventsCard() {
  return (
    <Card className="w-full max-w-xl rounded-xl overflow-hidden shadow-md">
      <img
        src="https://png.pngtree.com/png-vector/20220612/ourmid/pngtree-quiz-show-flat-color-vector-illustration-competition-presenter-vector-vector-png-image_31434098.jpg" // Replace this with your actual image URL
        alt="National Memory Championship"
        // className="h-32 w-full object-cover"
         className= "w-full aspect-[12/4] object-cover rounded-t-xl"
      />
      <CardContent className="space-y-1 p-2">
        <CardTitle className="text-base font-semibold text-black">
          National Memory Championship
        </CardTitle>
        <p className="text-sm text-gray-600">
          2025-05-15 · 00:00 AM
        </p>
        <p className="text-xs text-gray-500">
          Compete with the best minds.
        </p>
      </CardContent>    
      <CardFooter className="p-2 pt-0">
        <Button className="w-full  bg-blue-300 hover: bg-blue-400 text-black text-xs py-1.5">
          View Details
        </Button>
      </CardFooter>
    </Card>
  )  
}
  
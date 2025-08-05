import { Card, CardContent, CardHeader } from "../../ui/card"

export default function EventCard() {
    return (
        <Card>
            <CardHeader className="pb-2" />
            <CardContent>
                <div className="space-y-3">

                    {/* Events Card */}
                    <div className="rounded-lg border border-[#245cab]/20 bg-blue-300 p-3">
                        <div className="mb-2 text-center">
                            <h4 className="font-medium">Events</h4>
                        </div>
                        <div className="text-center text-2xl text-gray-700">
                            1234
                        </div>
                        <div className="mt-2 text-center text-sm font-medium">
                            <a href="/events/all" className="text-black hover:underline">
                                Events
                            </a>
                        </div>
                    </div>


                    {/* Practise Test Card */}
                    <div className="rounded-lg border border-[#245cab]/20 bg-blue-300 p-3">
                        <div className="mb-2 text-center">
                            <h4 className="font-medium">Practise Test</h4>
                        </div>
                        <div className="text-center text-2xl text-gray-700">
                            1234
                        </div>
                        <div className="mt-2 text-center text-sm font-medium">
                            <a href="/PractisePage" className="text-black hover:underline">
                                Practise
                            </a>

                         
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
}

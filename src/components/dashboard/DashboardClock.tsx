import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardClockProps {
    type: 'analog' | 'digital' | 'flip';
}

export function DashboardClock({ type }: DashboardClockProps) {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (type === 'analog') {
        return <AnalogClock time={time} />;
    } else if (type === 'flip') {
        return <FlipClock time={time} />;
    } else {
        return <DigitalClock time={time} />;
    }
}

function DigitalClock({ time }: { time: Date }) {
    return (
        <Card className="w-full max-w-sm bg-black text-green-500 border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
            <CardContent className="flex items-center justify-center p-6 bg-black">
                <div className="text-5xl font-mono tracking-widest">
                    {time.toLocaleTimeString([], { hour12: false })}
                </div>
            </CardContent>
        </Card>
    );
}

function FlipClock({ time }: { time: Date }) {
    // Simplified Flip Clock style (mimicking the aesthetic)
    const format = (num: number) => num.toString().padStart(2, '0');
    const hours = format(time.getHours());
    const minutes = format(time.getMinutes());
    const seconds = format(time.getSeconds());

    const FlipUnit = ({ val }: { val: string }) => (
        <div className="bg-[#333] text-white rounded px-2 py-4 text-4xl font-bold shadow-xl border-b-2 border-black relative">
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black opacity-50"></div>
            {val}
        </div>
    );

    return (
        <div className="flex justify-center items-center gap-2 p-4 bg-gray-100 rounded-xl shadow-2xl w-fit">
            <FlipUnit val={hours} />
            <span className="text-2xl font-bold">:</span>
            <FlipUnit val={minutes} />
            <span className="text-2xl font-bold">:</span>
            <FlipUnit val={seconds} />
        </div>
    );
}

function AnalogClock({ time }: { time: Date }) {
    const secondsRatio = time.getSeconds() / 60;
    const minutesRatio = (secondsRatio + time.getMinutes()) / 60;
    const hoursRatio = (minutesRatio + time.getHours()) / 12;

    return (
        <div className="w-40 h-40 bg-white border-4 border-gray-800 rounded-full relative shadow-2xl">
            {/* Clock Face Markers */}
            {[...Array(12)].map((_, i) => (
                <div
                    key={i}
                    className="absolute w-1 h-3 bg-black"
                    style={{
                        top: '5px',
                        left: '50%',
                        marginLeft: '-0.5px',
                        transformOrigin: '50% 70px', // 70px = half height (75) - top offset (5) approx
                        transform: `rotate(${i * 30}deg)`
                    }}
                />
            ))}

            {/* Hands */}
            <div
                className="absolute w-1 h-12 bg-black top-[24px] left-[50%] -ml-[2px] origin-bottom rounded-full"
                style={{ transform: `rotate(${hoursRatio * 360}deg)` }}
            />
            <div
                className="absolute w-1 h-16 bg-gray-600 top-[8px] left-[50%] -ml-[1px] origin-bottom rounded-full"
                style={{ transform: `rotate(${minutesRatio * 360}deg)` }}
            />
            <div
                className="absolute w-0.5 h-16 bg-red-500 top-[8px] left-[50%] -ml-[0.25px] origin-bottom"
                style={{ transform: `rotate(${secondsRatio * 360}deg)` }}
            />
            <div className="absolute w-3 h-3 bg-black rounded-full top-[50%] left-[50%] -mt-[6px] -ml-[6px]" />
        </div>
    );
}

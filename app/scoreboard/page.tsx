"use client";

import Image from 'next/image';
import { useState, useEffect } from "react";

interface Team {
  name: string;
  score: number;
  color: string;
  timeout: boolean;
}

interface ScoreboardState {
  team1: Team;
  team2: Team;
  time: number;
  isPaused: boolean;
  period: number;
  timeoutActive: boolean;
  timeoutTime: number;
  timeoutTeam: "team1" | "team2" | null;
  infoText: string,
}

const getDefaultScoreboard = (): ScoreboardState => ({
  team1: { name: " ", score: 0, color: "#335883", timeout: false },
  team2: { name: " ", score: 0, color: "#33833C", timeout: false },
  time: 600,
  isPaused: true,
  period: 1,
  timeoutActive: false,
  timeoutTime: 0,
  timeoutTeam: null,
  infoText: "",
});

export default function ScoreboardPage() {
  const [scoreboard, setScoreboard] = useState<ScoreboardState>(getDefaultScoreboard());

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const update: ScoreboardState = JSON.parse(event.data);
      console.log(update);
      setScoreboard(update);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      ws.close();
    };
  }, []);

  const formatTime = (seconds: number) => { 
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatPeriod = (period: number) => {
    if (period % 100 >= 11 && period % 100 <= 13) {
      return `${period}th`;
    }
    switch (period % 10) {
      case 1:
        return `${period}st`;
      case 2:
        return `${period}nd`;
      case 3:
        return `${period}rd`;
      default:
        return `${period}th`;
    }
  };

  return (
    <div className="min-h-screen min-w-screen bg-transparent flex items-center justify-end text-white flex-col">
      <div
        className={`absolute left-[658px] bottom-[120px] w-[118px] h-[64px] flex items-center justify-center text-[36px] bg-white bg-opacity-50 text-white transition-all duration-500 ease-in-out ${
          scoreboard.timeoutActive && scoreboard.timeoutTeam === "team1" 
            ? 'translate-y-0 opacity-100'
            : 'translate-y-[100%] opacity-0'
        }`}
      >
        {scoreboard.timeoutTime}
      </div>
      {/* Timeout Window for Team 2 */}
      <div
        className={`absolute right-[659px] bottom-[120px] w-[118px] h-[64px] flex items-center justify-center text-[36px] bg-white bg-opacity-50 text-white transition-all duration-500 ease-in-out ${
          scoreboard.timeoutActive && scoreboard.timeoutTeam === "team2"
            ? 'translate-y-0 opacity-100'
            : 'translate-y-[100%] opacity-0'
        }`}
      >
        {scoreboard.timeoutTime}
      </div>
      <div className="bg-[url('/assets/background.png')] min-w-[1252px] h-[64px] clip-trapezoid-bg rounded px-6 flex justify-between items-center"> 
        <div>
          
        </div>
        <div className="h-full w-[300px] pr-[40px] flex justify-center items-center">
          <Image
            src="/assets/logo.png"
            alt="Logo"
            width={120}
            height={110}
          />
          <Image
            className="-ml-4"
            src="/assets/name.png"
            alt="name"
            width={80}
            height={80}
          />
        </div>
        <div className="flex-grow flex justify-center items-center h-full bg-background-primary text-[48px] text-primary-black">
          {/* Team 1 Section */}
          <div className="flex border-r border-primary-black h-full flex-1 relative">
            <p className="flex justify-start items-center w-[60%] bg-[#335883] clip-trapezoid-name-l pt-3 px-12 text-primary">
              {scoreboard.team1.name}
            </p>
            <p className="flex justify-end items-center w-[40%] box-border pt-3 px-4">
              {scoreboard.team1.score}
            </p>
          </div>
          {/* Team 2 Section */}
          <div className="flex border-r border-primary-black h-full flex-1 relative">
            <p className="flex justify-start items-center w-[40%] box-border pt-3 px-4">
              {scoreboard.team2.score}
            </p>
            <p className="flex justify-end items-center w-[60%] bg-[#33833C] clip-trapezoid-name-r pt-3 px-12 text-primary">
              {scoreboard.team2.name}
            </p>
          </div>
        </div>
        <div className="w-[300px] flex h-full text-[36px]">
          <p className="w-[100px] flex justify-center items-center text-center pt-2 flex-1">
            {formatPeriod(scoreboard.period)}
          </p>
          <div className="border-l flex justify-center items-center flex-[2]">
            <p className="pt-2">{formatTime(scoreboard.time)}</p>
          </div>
        </div>
      </div>
      <div className="bg-black w-[604px] mb-8 h-[28px] text-xl px-6 flex clip-trapezoid-bg-inverted items-center justify-center tracking-wider overflow-hidden text-nowrap">
        {scoreboard.infoText}
      </div>
    </div>
  );
}
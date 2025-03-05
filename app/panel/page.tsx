"use client";

import { useState, useEffect, useRef } from "react";

interface Team {
  name: string;
  score: number;
  color: string;
  timeout: boolean;
}

interface Scoreboard {
  team1: Team;
  team2: Team;
  time: number;
  isPaused: boolean;
  period: number;
  timeoutActive: boolean;       
  timeoutTime: number;         
  timeoutTeam: "team1" | "team2" | null;
  infoText: string;
}

const getDefaultScoreboard = (): Scoreboard => ({
  team1: {
    name: "T1",
    score: 0,
    color: "#335883",
    timeout: false,
  },
  team2: {
    name: "T2",
    score: 0,
    color: "#33833C",
    timeout: false,
  },
  time: 600,
  isPaused: true,
  period: 1,
  timeoutActive: false,
  timeoutTime: 0,    
  timeoutTeam: null,
  infoText: "",
});

const buttonStyle = "flex bg-background-secondary text-primary rounded-[20px] py-3 font-bold items-center justify-center box-border";

export default function PanelPage() {
  const [scoreboard, setScoreboard] = useState<Scoreboard>(getDefaultScoreboard());
  const [previousScore, setPreviousScore] = useState<Scoreboard | null>(null);
  const ws =  useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8080");

    ws.current.onopen = () => {
      console.log("Connected to WebSocket server");
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setScoreboard(data);
    };

    return () => {
      if (ws.current) { 
        ws.current.close();
      }
    };
  }, []); 

  const setTeamName = (team: "team1" | "team2", name: string) => {
    if (scoreboard) {
      const newScoreboard = { ...scoreboard, [team]: { ...scoreboard[team], name } };
      setScoreboard(newScoreboard);
      ws.current?.send(JSON.stringify(newScoreboard));
    }
  };

  const setTeamScore = (team: "team1" | "team2", scoreToAdd: number) => {
    if (scoreboard) {
      const newScore = scoreboard[team].score + scoreToAdd;
      const newScoreboard = { ...scoreboard, [team]: { ...scoreboard[team], score: newScore } };
      setPreviousScore(scoreboard);
      setScoreboard(newScoreboard);
      ws.current?.send(JSON.stringify(newScoreboard));
    }
  };
  
  const setPeriod = (increment: number) => {
    if (scoreboard) {
      const newPeriod = scoreboard.period + increment;
      const newScoreboard = { ...scoreboard, period: newPeriod };
      setScoreboard(newScoreboard);
      ws.current?.send(JSON.stringify(newScoreboard));
    }
  };
  
  const toggleTimer = () => {
    if (scoreboard) {
      const newScoreboard = { ...scoreboard, isPaused: !scoreboard.isPaused };
      setScoreboard(newScoreboard);
      ws.current?.send(JSON.stringify(newScoreboard));
    }
  };

  const resetAll = () => {
    const resetScoreboard: Scoreboard = {
      team1: { name: "", score: 0, color: "#ff0000", timeout: false },
      team2: { name: "", score: 0, color: "#0000ff", timeout: false },
      time: 600,
      isPaused: true,
      period: 1,
      timeoutActive: false,
      timeoutTime: 0,
      timeoutTeam: null,
      infoText: "",
    };
    setScoreboard(resetScoreboard);
    ws.current?.send(JSON.stringify(resetScoreboard));
  };

  const revertLastChanges = (team: "team1" | "team2") => {
    if (previousScore) {
      const revertedScoreboard = {
        ...scoreboard,
        [team]: {
          ...scoreboard[team],
          score: previousScore[team].score,
        },
      };
      setScoreboard(revertedScoreboard);
      ws.current?.send(JSON.stringify(revertedScoreboard));
    }
  };
  
  
  const handleTimeout = (team: "team1" | "team2") => {
    if (scoreboard) {
      const newScoreboard = {
        ...scoreboard,
        [team]: { ...scoreboard[team], timeout: !scoreboard[team].timeout },
      };
      setScoreboard(newScoreboard);
      ws.current?.send(JSON.stringify(newScoreboard));
    }
  };

  const handleInfoTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newInfoText = e.target.value;
    const updatedScoreboard = { ...scoreboard, infoText: newInfoText };
    setScoreboard(updatedScoreboard);
    ws.current?.send(JSON.stringify(updatedScoreboard));
  };

  return (
    <div className="min-h-screen bg-background px-[100px] py-8 text-primary font-lexend">
      <style jsx>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
          cursor: text; 
        }
      `}</style>
      <h1 className="text-4xl font-bold mb-8 text-left">Basketbols</h1>

      <div className="grid grid-cols-[1fr_0.7fr_1fr] gap-6 max-w-6xl mx-auto text-primary-black">
        {/* Team 1 */}
        <div className="bg-background-primary p-6 rounded-[20px]">
          <h2 className="text-2xl font-bold mb-4 text-center">KOMANDA 1</h2>
          <input
            value={scoreboard?.team1.name}
            onChange={(e) => setTeamName("team1", e.target.value)}          
            className={`${buttonStyle} text-center w-full placeholder:text-primary-grey placeholder:text-placeholder mb-4`}
            placeholder="Ievadiet nosaukumu šeit..."
            maxLength={3}
          />
          <h2 className="text-2xl font-bold mb-4 text-center">SKAITS</h2> {/** potenciali sito jamaina uz input field */}
          <div className="flex row justify-between gap-[24px] mb-4">
            <input
              type="number"
              value={scoreboard?.team1.score || 0}
              onChange={(e) => {
                const newScore = parseInt(e.target.value) || 0;
                setTeamScore("team1", newScore - scoreboard.team1.score);
              }}
              className={`${buttonStyle} flex-1 text-center`}
            />
            <div className="flex-1 grid grid-cols-1 gap-1">
              <button
                onClick={() => setTeamScore("team1", 1)}
                className={`${buttonStyle}`}
              >
                +1
              </button>
              <button
                onClick={() => setTeamScore("team1", 2)}
                className={`${buttonStyle}`}
              >
                +2
              </button>
              <button
                onClick={() => setTeamScore("team1", 3)}
                className={`${buttonStyle}`}
              >
                +3
              </button>
            </div>
          </div>
          <button
            onClick={() => revertLastChanges("team1")}
            className={`${buttonStyle} w-full uppercase mb-4`}
          >
            atsaukt iepriekšējos punktus 
          </button>
          <button //timeout
            onClick={() => handleTimeout("team1")}
            className={`${buttonStyle} w-full uppercase`}
          >
            timeout
          </button>
        </div>

        {/* Timer */}
        <div className="bg-background-primary p-6 rounded-[20px] shadow-lg flex flex-col">
          <div className="h-[50%] flex flex-col">
            <h2 className="text-2xl font-bold mb-4 text-center uppercase">Laiks</h2>
            <div className="grid grid-rows-2 gap-2 flex-grow">
            <p className={`${buttonStyle} w-full`}>
              {scoreboard ? (
                `${Math.floor(scoreboard.time / 60).toString().padStart(2, '0')}:${(scoreboard.time % 60).toString().padStart(2, '0')}`
              ) : (
                "00:00"
              )}
            </p> 
              <button
                onClick={toggleTimer}
                className={`${buttonStyle} w-full`}
              >
                {scoreboard?.isPaused ? "Start" : "Pause"}
              </button>
            </div>
          </div>
          <div className="h-[50%] flex flex-col">
            <h2 className="text-2xl font-bold text-center mt-6 mb-4 uppercase">ceturksnis</h2>
            <div className="grid grid-rows-2 gap-2 flex-grow">
              <p className={`${buttonStyle} w-full`}>{scoreboard?.period}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setPeriod(-1)}
                  className={`${buttonStyle}`}
                >
                  -
                </button>
                <button
                  onClick={() => setPeriod(1)}
                  className={`${buttonStyle}`}
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Team 2 */}
        <div className="bg-background-primary p-6 rounded-[20px]">
          <h2 className="text-2xl font-bold mb-4 text-center">KOMANDA 2</h2>
          <input
            value={scoreboard?.team2.name}
            onChange={(e) => setTeamName("team2", e.target.value)}
            className={`${buttonStyle} text-center mb-4 w-full placeholder:text-primary-grey placeholder:text-placeholder`}
            placeholder="Ievadiet nosaukumu šeit..."
            maxLength={3}
          />
          <h2 className="text-2xl font-bold mb-4 text-center">SKAITS</h2>
          <div className="flex row justify-between gap-[32px] mb-4">
            <input
              type="number"
              value={scoreboard?.team2.score || 0}
              onChange={(e) => {
                const newScore = parseInt(e.target.value) || 0;
                setTeamScore("team2", newScore - scoreboard.team2.score);
              }}
              className={`${buttonStyle} flex-1 text-center`}
            />
            <div className="flex-1 grid grid-cols-1 gap-1">
              <button
                onClick={() => setTeamScore("team2", 1)}
                className={`${buttonStyle}`}
              >
                +1
              </button>
              <button
                onClick={() => setTeamScore("team2", 2)}
                className={`${buttonStyle}`}
              >
                +2
              </button>
              <button
                onClick={() => setTeamScore("team2", 3)}
                className={`${buttonStyle}`}
              >
                +3
              </button>
            </div>
          </div>
          <button
            onClick={() => revertLastChanges("team2")} 
            className={`${buttonStyle} w-full uppercase mb-4`}
          >
            atsaukt iepriekšējos punktus
          </button>
          <button //timeout
            onClick={() => handleTimeout("team2")}
            className={`${buttonStyle} w-full uppercase`}
          >
            timeout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-6xl mx-auto text-primary-black mt-6">
        <div className="bg-background-primary flex rounded-[20px] p-6 items-center">
          <p className="font-bold mr-4">Tablo outputs</p>
          <p className={`${buttonStyle} flex-1`}>http://localhost:3000/scoreboard</p>
        </div>
        <div className="bg-background-primary flex rounded-[20px] p-6 items-center">
        <button
          onClick={resetAll}
          className={`${buttonStyle} w-full uppercase`}
        >
          atiestatīt visu
        </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 max-w-6xl mx-auto text-primary-black mt-6">
        <div className="bg-background-primary flex rounded-[20px] p-6 items-center">
          <span className="font-bold mr-4">Informacija: </span>
          <input
            type="text"
            value={scoreboard.infoText}
            onChange={handleInfoTextChange}
            className={`${buttonStyle} text-center w-full placeholder:text-primary-grey placeholder:text-placeholder`}
            placeholder="Ievadiet info tekstu šeit..."
          />
        </div>
      </div>
    </div>
  );
}
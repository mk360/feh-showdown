import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useState } from "react";

export const gameContext = createContext<{
    game?: JSONEntity[];
    setGame?: Dispatch<SetStateAction<JSONEntity[] | undefined>>;
}>({

});


function GameContext({ children }: { children: ReactNode }) {
    const [game, setGame] = useState<JSONEntity[] | undefined>();

    return <gameContext.Provider value={{ game, setGame }}>
        {children}
    </gameContext.Provider>
};

export const useGameContext = () => useContext(gameContext);

export default GameContext;

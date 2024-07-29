import { useContext, useEffect, useState } from "react"
import { ThemeContext } from "../App";


export const ShowClassPower = ({title, length, setTable}) => {
    const { setTheme, theme } = useContext(ThemeContext);
    const [clicked, setclicked] = useState(true);
    const onSetClicked = (event) => {
        setclicked(!clicked);
        setTable(title, clicked);
    }
  
    return (
        <div className="col">
            <div className={`card border-1 p-1 ${!clicked?'border-primary':''} ${theme === "dark" ? "bg-dark text-white" : "bg-light"}`} onClick={onSetClicked} >
                <div class="card-header">{title}</div>
                <div class="card-body">
                    <h5 class="card-text">{length}</h5>
                </div>
            </div>
        </div> 
    )
}

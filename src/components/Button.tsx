import React from 'react'

export default function Button({children, onClick, className, ariaLabel}:{children:React.ReactNode; onClick?:()=>void; className?:string; ariaLabel?:string}){
  return (
    <button aria-label={ariaLabel} className={`button ${className||''}`} onClick={onClick}>
      {children}
    </button>
  )
}

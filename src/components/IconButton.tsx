import React from 'react'

export default function IconButton({children, onClick, ariaLabel}:{children:React.ReactNode; onClick?:()=>void; ariaLabel?:string}){
  return (
    <button aria-label={ariaLabel} onClick={onClick} style={{background:'transparent',border:'none',padding:8,borderRadius:10,display:'inline-flex',alignItems:'center',justifyContent:'center'}}>
      {children}
    </button>
  )
}

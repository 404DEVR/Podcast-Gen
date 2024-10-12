"use client"

import { Input } from '@/components/ui/input'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useDebounce } from '@/lib/UseDebounse'

const SearchBar = () => {
    const [search,setSearch]=useState('')
    const router=useRouter()
    const pathname=usePathname()
    const debounceValue=useDebounce(search,500)
    useEffect(() => {
      if (debounceValue) {
        router.push(`/discover?search=${debounceValue}`);
      } else if (!debounceValue && pathname === "/discover") {
        router.push("/discover");
      }
    }, [router, pathname, debounceValue]);
  return (
    <div className='relative block '>
      <Input className='input-class py-6 pl-12 focus-visible:ring-offset-orange-1' onChange={(e)=>setSearch(e.target.value)} value={search} onLoad={()=>setSearch("")}/>
      <Image src='/icons/search.svg' alt='search' width={20} height={20} className='absolute left-4 top-3.5'/>
    </div>
  )
}

export default SearchBar

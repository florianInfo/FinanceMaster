import React from "react"
import FirstComponent from './FirstComponent/FirstComponent'
import './globals.css'

export default function Home() {
  return (
    <div class="container">
      <h1>Hello World</h1>
      <FirstComponent count='1'></FirstComponent>
      <FirstComponent count='2'></FirstComponent>
      <FirstComponent count='3'></FirstComponent>
      <FirstComponent count='4'></FirstComponent>
      <FirstComponent count='5'></FirstComponent>
    </div>
  );
}

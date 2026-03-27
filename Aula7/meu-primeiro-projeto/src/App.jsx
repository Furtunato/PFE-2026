import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

function App() {

  return (
  <div>
    <h1>Olá, React!</h1>
    <p>Estou alterando meu primeiro componente.</p>
    <Saudacao />
    <Perfil nome = "Gabriel" cargo = "Dev Senior"/>
    <Painel />
    <Flamengo tecnico= 'Leo Jardim' garcom= 'Arraxxxca' danca='Paquetop' reverencia= 'Queixada' idolo= 'Zico' />
    <PlacarFutebol/>
  </div>
  )
}

export default App

function Saudacao({}){
  return (
    <div style={{backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '8px', marginBottom: '10px' }}>
      <h2 style={{color: '#007bff' }}>Olá, Aluno!</h2>
      <p>Este componente foi criado separadamente.</p>
    </div>
  );
}

function Perfil({nome, cargo}){
  return (
    <div style={{backgroundColor: '#f0f0f0', padding: '13px', borderRadius: '12px', marginBottom: '18px'}}>
        <h3 style={{margin: '0 0 5px 0', color: 'rgb(19, 179, 201)'}}>Nome: {nome} </h3>
        <p style={{margin: 0, color: '#444'}}>Cargo: <strong>{cargo}</strong></p>
    </div>
  )
}

function Painel(){
  const [texto, setTexto] = useState('');
  return (
    <div style={{backgroundColor: '#f9f9f9', padding: '15px', border: '1px dashed #666', marginTop: '20px'}}>
      <h4>Escreva uma mensagem:</h4>
      <input type="text" placeholder='Digite algo...' onChange={(e) => setTexto(e.target.value)} style={{padding: '8px', width: '80%'}}/>
      <p>O que você digitou: <span style={{color: 'red'}}>{texto}</span></p>
    </div>
  )
}

function Flamengo({tecnico, garcom, danca, reverencia, idolo}) {
  return (
    <div style={{backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '13px', marginBottom: '12px'}}>
        <h2 style={{color: 'red'}}> Flamengo </h2>
        <p>Técnico: <strong>{tecnico}</strong></p>
        <p>Garçom: <strong>{garcom}</strong></p>
        <p>Dança: <strong>{danca}</strong></p>
        <p>Reverância: <strong>{reverencia}</strong></p>
        <p>Idolo: <strong>{idolo}</strong></p>
    </div>
  )
}

function PlacarFutebol({nomeTimeA, nomeTimeB}) {
  const [golsA, setGolsA] = useState(0);
  const [golsB, setGolsB] = useState(0);

  return (
    <div style={{border: '3px solid #2e7d32', borderRadius: '15px', padding: '20px', textAlign: 'center', backgroundColor: '#f1f8e9', fontFamily: 'Arial, sans-serif', maxWidth: '400px', margin: '20px auto'}}>
      <h2 style={{color: '#1b5e20'}}>Placar do Jogo</h2>

      <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}></div>

      {/* Lado do Time A */}
      <div>
        <h3>{nomeTimeA}</h3>
        <h1 style={{fontSize: '40px', margin: '10px 0'}}>{golsA}</h1>
        <button onClick={() => setGolsA(golsA + 1)} style={botaoEstilo}>GOL!</button>
      </div>

      <h1 style={{margin: '0 20px'}}>X</h1>

      {/* Lado do time B */}
      <div>
        <h3>{nomeTimeB}</h3>
        <h1 style={{ fontSize: '40px', margin:'10px 0'}}>{golsB}</h1>
        <button onClick={() => setGolsB(golsB + 1)} style={botaoEstilo}>GOL!</button>
      </div>
    </div>
  )
}


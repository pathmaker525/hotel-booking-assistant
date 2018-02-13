import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import styles from './admin.css'

class AdminAPP extends React.Component {
  constructor(props){
    super(props)
    //stage 0===login 1===main
    this.state = {
      accessToken: "",
      userID: "",
      userPW: "",
      stage: 0,
      modalstate: 0,
      events:[]
    }

    //this function will be bound to 'this' of top parent object(AdminAPP)
    //so that if child object calls this function,
    //it will still remain as parent's 'this'
    this.dbreset = this.dbreset.bind(this)
    this.closemodal = this.closemodal.bind(this)
    this.acceptmodal1 = this.acceptmodal1.bind(this)
  }

  updateValues(e){
    const key = e.target.name
    this.setState({
      [key]:e.target.value
    })
  }

  loginAttempt(e) {
      e.preventDefault()
      //pretends faux login
      this.authorize(this.state.userID,this.state.userPW)
  }

  //this.state.value = XXX     →      change is not observed
  //this.state.setState({value:XXX})      →    changed is observed, render result will be refreshed
  authorize(targetId,targetPw){
    console.log("로그인을 시도합니다 :",targetId)
    request.get('/admin/login')
            .query({
              userid:this.state.userID,
              userpw:this.state.userPW
            })
            .end((err,data)=>{
              console.log('login finished-token received :' + data.body.token)
              this.setState({
                accessToken:data.body.token,
                stage:1,
                userPW:""})
            })
  }

  dbreset(e){
    e.preventDefault()
    console.log("DB초기화가 요청되었습니다.")

    this.setState({modalstate:1})
  }

  closemodal(e){
    e.preventDefault()
    this.setState({modalstate:0})
  }
  acceptmodal1(){
    request.get('/admin/dbreset')
    .query({
      token:this.state.accessToken
    })
    .end((err,data)=>{
      console.log('db reset result:' + data.body.result)
    })
    alert('데이터베이스가 초기화 되었습니다')
    this.setState({modalstate:0})
  }

  render(){
    const updateValues = e => this.updateValues(e)
    const loginAttempt = e => this.loginAttempt(e)

    let frmLoginRender = (<div>잘못된 접속 시도입니다.</div>)
    if(this.state.stage === 0){
      frmLoginRender = (
      <form onSubmit={loginAttempt}>
        <div>
          <label> ID </label>
          <input name="userID" type="text" placeholder="아이디를 입력하세요" onChange={updateValues} />
        </div>
        <div>
          <label> PW </label>
          <input name="userPW" type="password" placeholder="비밀번호를 입력해 주세요" onChange={updateValues} />
        </div>
        <input type="submit" value="로그인"/>
      </form>
      )
    }else if(this.state.stage === 1){
      //------------------------the first page, when logged in
      frmLoginRender = (
        <form>
          <p>사용자 아이디 : {this.state.userID}</p>
          <FrmControlPanel dbreset={this.dbreset} />
          <Modal modalstate={this.state.modalstate} closemodal={this.closemodal} acceptmodal1={this.acceptmodal1}/>
        </form>
      )
    }
    return frmLoginRender
  }
  
}

class FrmControlPanel extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    return(
      <div>
        <button onClick={this.props.dbreset}>데이터 삭제</button>
      </div>
    )
  }
}

class Modal extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      prompt:""
    }
    this.accept1 = this.accept1.bind(this)
    this.updatePrompt = this.updatePrompt.bind(this)
  }

  updatePrompt(e){
    e.preventDefault()
    this.setState({
      prompt:e.target.value
    })
  }

  accept1(e){
    e.preventDefault()
    if(this.state.prompt === "초기화"){
      this.props.acceptmodal1() 
    }
  }

  render(){
    const styleBack = {
      position:'fixed',
      top:0,bottom:0,left:0,right:0,
      backgroundColor:'rgba(0,0,0,0.4)',
      padding:50
    }

    const styleModal = {
      backgroundColor: '#fff',
      borderRadius: 5,
      maxWidth:500,
      maxHeight:300,
      margin: '0 auto',
      padding: 30
    }

    const warning ={
      color:'red',
      padding:10,
      backgroundColor:'pink'
    }

    let ms = this.props.modalstate
    if(!ms){
      return null
    }else if(ms === 1){
      return (
        <div style={styleBack}>
          <div style={styleModal}>
            {ms}
            <p style={warning}>DB를 정말로 초기화하시겠습니까? 동의할 경우 '초기화'라고 입력해 주세요</p>
            <input type="text" onChange={this.updatePrompt} />
            <button onClick={this.accept1}>입력</button>
            <button onClick={this.props.closemodal}>창 닫기</button>
          </div>
        </div>
        )
    }
  }
}

class LiEvent extends React.Component{
  constructor(props){
    super(props)
    this.state = {

    }
  }

}

const content = (
  <AdminAPP />
)

ReactDOM.render(content,document.getElementById('root'))
import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'

class FrmLogin extends React.Component {
  constructor(props){
    super(props)
    //stage 0===login 1===main
    this.state = {
      accessToken: "",
      userID: "",
      userPW: "",
      stage: 0
    }
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

  authorize(targetId,targetPw){
    console.log("로그인을 시도합니다 :",targetId)
    request.get('/admin/login')
            .query({
              userid:this.state.userID,
              userpw:this.state.userPW
            })
            .end((err,data)=>{
              console.log('login finished')
            })
  }

  render(){

    const updateValues = e => this.updateValues(e)
    const loginAttempt = e => this.loginAttempt(e)

    //in JSX, must use htmlFor="value" instead of for="value"
    let frmLoginRender = (<div>잘못된 페이지로 이동하였습니다. 다시 접속해주세요.</div>)
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
      frmLoginRender = (
        <p>당신은 로그인 되었습니다</p>
      )
    }


    return frmLoginRender
  }
  
}

const content = (
  <FrmLogin />
)

ReactDOM.render(content,document.getElementById('root'))
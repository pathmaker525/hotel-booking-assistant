import React from 'react'
import ReactDOM from 'react-dom'
import request from 'superagent'
import styles from './admin.css'
import moment from 'moment'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Toggle from 'material-ui/Toggle'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'


// ------------------------------ parent admin form
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
      events:[],
      targetEvent:{}
    }

    //this function will be bound to 'this' of top parent object(AdminAPP)
    //so that if child object calls this function,
    //it will still remain as parent's 'this'
    this.dbreset = this.dbreset.bind(this)
    this.closemodal = this.closemodal.bind(this)
    this.acceptmodal1 = this.acceptmodal1.bind(this)
    this.modifyEvent = this.modifyEvent.bind(this)
    this.addEvent = this.addEvent.bind(this)
    this.resetstage = this.resetstage.bind(this)
    this.updateFormValues = this.updateFormValues.bind(this)
    this.updateFormToggle = this.updateFormToggle.bind(this)
    this.updateValues = this.updateValues.bind(this)
    this.keyhandler = this.keyhandler.bind(this)
  }

  updateValues(e){
    const key = e.target.name
    this.setState({
      [key]:e.target.value
    })
  }

  updateFormValues(e){
    let temp = Object.assign(this.state.targetEvent)
    temp[e.target.name] = e.target.value
    this.setState({
      targetEvent: temp
    })
  }
  updateFormToggle(e, tgl){
    let temp = Object.assign(this.state.targetEvent)
    temp[e.target.name] = tgl
    this.setState({
      targetEvent: temp
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
              request.get('/eventJSON')
                      .end((err,data)=>{
                        this.setState({event:data.body})
                      })
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

  resetstage(e){
    e.preventDefault()
    this.setState({stage:1})
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

  addEvent(e){
    e.preventDefault()
    this.modifyEvent(this.state.events.length + 1)
  }

  modifyEvent(eventid){
    alert(`이벤트${eventid} 편집합니다`)
    request.get('/admin/eventdetail')
    .query({
      eventid:eventid
    })
    .end((err,data)=>{
      console.log(data.body)
      this.setState({stage:2,targetEvent:data.body})
    })
  }

  keyhandler(e){
    if (e.key === "Enter" && this.state.stage === 0){
      this.loginAttempt(e)
    }
  }

  render(){
    const updateValues = e => this.updateValues(e)
    const loginAttempt = e => this.loginAttempt(e)
    const updateFormValues = e =>this.updateFormValues(e)
    // ------------------------------ log-in page
    if(this.state.stage === 0){
      return (
      <MuiThemeProvider>
        <TextField hintText="관리자명" name="userID" onChange={updateValues} /><br />
        <TextField hintText="비밀번호" floatingLabelText="비밀번호" type="password" name="userPW" onChange={updateValues} onKeyPress={this.keyhandler}/><br />
        <RaisedButton label="로그인" onClick={loginAttempt} />
      </MuiThemeProvider>
      )

    }else if(this.state.stage === 1){
      //------------------------the first page, when logged in

      console.log('event json loaded :', this.state.event)

      if(this.state.event){
        return (
          <MuiThemeProvider>
          <p>사용자 아이디 : {this.state.userID}</p>
          {
            this.state.event.map((el,index)=>{
            return <LiEvent eventid={el.eventid} title={el.title} startdate={el.datestart} enddate={el.dateend} modifyEvent={this.modifyEvent}/>
            })
          }
          <RaisedButton label="이벤트 새로 추가" onClick={this.addEvent} />
          <RaisedButton label="데이터 전부 초기화" onClick={this.dbreset} />
          <Modal modalstate={this.state.modalstate} closemodal={this.closemodal} acceptmodal1={this.acceptmodal1}/>
          </MuiThemeProvider>
        )
      }else{
        //when json is not loaded yet if(!this.state.event)
        return <div>정보를 읽고 있습니다</div>
      }

    }else if(this.state.stage === 2){
      //---------------------------event edit page
      const ev = this.state.targetEvent
      return (
        <MuiThemeProvider>

          <p>이벤트 id:{this.state.targetEvent.eventid}</p>
          <hr />
          <TextField floatingLabelText="이벤트명" defaultValue={ev.title} onChange={updateFormValues} name="title" fullWidth={true} /><br />
          <TextField floatingLabelText="짧은 설명" value={ev.brief} onChange={updateFormValues} name="brief" fullWidth={true} /><br />
          <TextField floatingLabelText="관련 웹페이지 주소" value={ev.link} onChange={updateFormValues} name="link" fullWidth={true} /><br />
          <TextField floatingLabelText="상세 설명(여러줄 입력 가능)" value={ev.description} onChange={updateFormValues} name="description" multiLine={true} fullWidth={true} /> <br/>

          <Toggle label="시행중인 이벤트" name="enabled" onToggle={this.updateFormToggle} labelPosition="right" toggled={ev.enabled} /> <br />

          <DatePicker hintText="시작일자" name={ev.datestart} onChange={updateFormValues} />
          <DatePicker hintText="종료일자" name={ev.dateend} onChange={updateFormValues} />
          <SelectField floatingLabelText="중요도" value={ev.priority} onChange={updateFormValues}>
            <MenuItem value={1} primaryText="매우중요 - 제일 먼저 표시" />
            <MenuItem value={2} primaryText="중요" />
            <MenuItem value={3} primaryText="보통" />
            <MenuItem value={4} primaryText="중요하지 않음 - 제일 나중에 표시" />
          </SelectField>
          
          <RaisedButton label="등록(수정)" onClick={this.acceptModify} />
          <RaisedButton label="삭제" onclick={this.eventDelete} />
          <RaisedButton label="취소" onClick={this.resetstage} />

        </MuiThemeProvider>
      )
    }else{
      return <div> 잘못된 접속 시도입니다. </div>
    }
  }
  
}

// ------------------------------ modal form
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

    let ms = this.props.modalstate
    if(!ms){
      return null
    }else if(ms === 1){
      return (
        <div className={styles.modalBack}>
          <div className={styles.modal}>
            modalstate:{ms}
            <p className={styles.warning}>DB를 정말로 초기화하시겠습니까? 동의할 경우 '초기화'라고 입력해 주세요</p>
            <input type="text" onChange={this.updatePrompt} />
            <button onClick={this.accept1}>입력</button>
            <button onClick={this.props.closemodal}>창 닫기</button>
          </div>
        </div>
        )
    }
  }
}

// ------------------------------ event list component
class LiEvent extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      eventid:this.props.eventid,
      title:this.props.title,
      startdate:moment(this.props.startdate).format("YYYY.MM.DD"),
      enddate:moment(this.props.enddate).format("YYYY.MM.DD")
    }
    this.modify = this.modify.bind(this)
  }
  modify(e){
    e.preventDefault()
    this.props.modifyEvent(Math.round(this.state.eventid))
  }
  //<LiEvent eventid="" title="" startdate="" enddate="" modifyEvent={this.modifyEvent}>
  render(){
    return(
      <div>
        <a href="#" onClick={this.modify}>
          - {this.state.title} | {this.state.startdate} ~ {this.state.enddate}
        </a>
      </div>
    )
  }
}

const content = (
  <AdminAPP />
)

ReactDOM.render(content,document.getElementById('root'))
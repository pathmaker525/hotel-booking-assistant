import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
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
import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table'
import {Tabs, Tab} from 'material-ui/Tabs'

// -------------------------------- Main Page
class AdminApp extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      adminId:"",
      adminToken:"",
      targetid:0
    }
    this.updateAuth = this.updateAuth.bind(this)
    this.updateTarget = this.updateTarget.bind(this)
  }
  //TODO - Check if exact path='/' is right setting
  updateAuth(newId, newToken){
    console.log("token updated to", newToken)
    this.setState({adminId:newId, adminToken:newToken})
  }

  updateTarget(newTarget){
    this.setState({targetid:newTarget})
  }

  render(){
    return (
    <div>
    <Router>
      <MuiThemeProvider>
      <div>
      <AdminNav id={this.state.adminId} />
      <Switch>
        <Route exact path='/admin' render={(props) => <AdminLogin updateAuth={this.updateAuth}/>} />
        <Route path='/admin/control' render={(props) => <AdminControl token={this.state.adminToken} updateTarget={this.updateTarget} />} />
        <Route path='/admin/modifyevent' render={(props) => <ModifyEvent token={this.state.adminToken} targetid={this.state.targetid} createnew={false} /> } />
        <Route path='/admin/modifydesc' render={(props) => <ModifyDesc token={this.state.adminToken} targetid={this.state.targetid} />} />
        <Route path='/admin/createevent' render={(props) =><ModifyEvent token={this.state.adminToken} targetid={this.state.targetid} createnew={true} />} />
        <Route component={ WrongAccess } />
      </Switch>
      </div>
      </MuiThemeProvider>
    </Router>
    </div>
    )
  }
}

// ---------------------------- Main Header(Nav)
class AdminNav extends React.Component {
  constructor(props){
    super(props)
  }
  render(){
    return (
      <div className={styles.nav} > {this.props.id ? 
          <span>로그인됨 : {this.props.id} </span> 
          : <span>아직 로그인되지 않았습니다</span> }
      </div>
    )
  }
}


//----------------------------- 404 Page
const WrongAccess = () => {
  return (
    <div>잘못된 접속 시도입니다.</div>
  )
}


// ----------------------------------- Login Page
class AdminLogin extends React.Component {
  constructor (props){
    super(props)

    this.state = {
      userID: "",
      userPW: "",
      logged:false
    }

    this.updateValues = this.updateValues.bind(this)
    this.loginAttempt = this.loginAttempt.bind(this)
    this.keyhandler = this.keyhandler.bind(this)
  }

  updateValues(e){
    e.preventDefault()
    this.setState({
      [e.target.name]:e.target.value
    })
  }

  keyhandler(e){
    if (e.key === "Enter") this.loginAttempt(e) ;
  }

  loginAttempt(e){
    e.preventDefault()
    console.log("로그인을 시도합니다 :",this.state.userID)
    request.get('/admin/login')
            .query({
              userid:this.state.userID,
              userpw:this.state.userPW
            })
            .end((err,data)=>{
              console.log('login finished-token received :' + data.body.token)
              this.props.updateAuth(this.state.userID, data.body.token)
              this.setState({userPW:"",logged:true})
            })
  }

  render(){
    const updateValues = e => this.updateValues(e)
    return(
      <div className={styles.loginwrap}>
        <div>
          <h3>스텔라마리나 관리자 페이지</h3>
          <TextField floatingLabelText="관리자명" name="userID" onChange={updateValues} onKeyPress={this.keyhandler} /><br />
          <TextField floatingLabelText="비밀번호" type="password" name="userPW" onChange={updateValues} onKeyPress={this.keyhandler}/><br />
          <RaisedButton label="로그인" onClick={this.loginAttempt} />
          {this.state.logged ? <Redirect to="/admin/control" /> : null }
        </div>
      </div>
    )
  }
}


//----------------------------------------Main Control Page
class AdminControl extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      events:[],
      descs:[],
      eventsShowAll:false,
      modify:0
    }

    this.handleToggle = this.handleToggle.bind(this)
    this.handleTabActive = this.handleTabActive.bind(this)
    this.updateEvent = this.updateEvent.bind(this)
    this.updateDesc = this.updateDesc.bind(this)
    this.activeModifyEvent = this.activeModifyEvent.bind(this)
    this.activeModifyDesc = this.activeModifyDesc.bind(this)
    this.createEvent = this.createEvent.bind(this)

    this.updateEvent()
  }

  handleToggle(e,toggled){
    this.setState({
      [e.target.name]: toggled
    })
    if(e.target.name === "eventsShowAll"){
     this.updateEvent()
    }
  }

  handleTabActive(tab){
    if(tab.props['data-type'] === "event"){
      this.updateEvent()
    }else if(tab.props['data-type'] === "desc"){
      this.updateDesc()
    }
  }

  updateEvent(){
    request.get('/queryJSON')
    .query({
      type:"event",
      showall:this.state.eventsShowAll
    })
    .end((err,data) => {
      console.log('event query finished', data.body.queryevent)
      this.setState({events:data.body.queryevent})
    })

  }

  updateDesc(){
    request.get('/queryJSON')
    .query({
      type:"desc"
    })
    .end((err,data) => {
      console.log('description query finished', data.body.querydesc)
      this.setState({descs:data.body.querydesc})
    })
  }

  activeModifyEvent(row,column,e){
    this.props.updateTarget(this.state.events[row].eventid)
    this.setState({modify:1})
  }

  activeModifyDesc(row,column,e){
    this.props.updateTarget(this.state.descs[row].descid)
    this.setState({modify:2})
  }

  createEvent(e){
    e.preventDefault()
    request.get('/queryJSON')
    .query({
      type:"eventlastid"
    })
    .end((err,data)=>{
      console.log('last event id fetched :',data.body.querylastid)
      this.props.updateTarget(data.body.querylastid + 1)
      this.setState({modify:3})
    })
  }

  render(){
    return (
      <Tabs>

        {/* ---------------------event and promotion list-----------------------  */}
        <Tab label="이벤트 및 프로모션" data-type="event" onActive={this.handleTabActive}>
          <Table selectable={false} onCellClick={this.activeModifyEvent}>
            <TableHeader displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>이벤트명</TableHeaderColumn>
                <TableHeaderColumn>시작일</TableHeaderColumn>
                <TableHeaderColumn>종료일</TableHeaderColumn>
                <TableHeaderColumn>중요도</TableHeaderColumn>
                <TableHeaderColumn>표시 여부</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody showRowHover={true}>
              {this.state.events.map((row, index) => (
                <TableRow key={index}>
                  <TableRowColumn>{row.title}</TableRowColumn>
                  <TableRowColumn>{moment(row.datestart).format('YYYY-MM-DD')}</TableRowColumn>
                  <TableRowColumn>{moment(row.dateend).format('YYYY-MM-DD')}</TableRowColumn>
                  <TableRowColumn>{row.priority}</TableRowColumn>
                  <TableRowColumn>{row.enabled ? '표시됨' : '표시 안함'}</TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <br />
          {this.state.events.length <= 0 ? <div>등록된 프로모션이 아직 없습니다</div> : null}
          <hr />
          <Toggle name="eventsShowAll" label="기한이 지났거나 숨긴 이벤트도 모두 표시"
            onToggle={this.handleToggle} defaultToggled={this.state.eventsShowAll} labelPosition="right"/>
          <RaisedButton label="새로운 프로모션 등록하기" onClick={this.createEvent}/>
        </Tab>
        
        {/* ------------------------description list-----------------------------  */}

        <Tab label="페이지 내용 편집" data-type="desc" onActive={this.handleTabActive}>
          <Table selectable={false}>
            <TableHeader displaySelectAll={false}>
              <TableRow>
                <TableHeaderColumn>설명 이름</TableHeaderColumn>
                <TableHeaderColumn>내용</TableHeaderColumn>
                <TableHeaderColumn>편집 일자</TableHeaderColumn>
              </TableRow>
            </TableHeader>
            <TableBody showRowHover={true}>
              {this.state.descs.map((row,index) => (
                <TableRow key={index}>
                  <TableRowColumn>{row.title}</TableRowColumn>
                  <TableRowColumn>{row.context.slice(0,10)}...</TableRowColumn>
                  <TableRowColumn>{moment(row.dateedit).format('YYYY-MM-DD')}</TableRowColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Tab>
        <RaisedButton label="모든 내용 초기화하기" />
        {this.state.modify === 1 ? <Redirect to="/admin/modifyevent" /> : null }
        {this.state.modify === 2 ? <Redirect to="/admin/modifydesc" /> : null }
        {this.state.modify === 3 ? <Redirect to="/admin/createevent" /> : null }
      </Tabs>

    )
  }
}

//-------------------- event & promotion edit page
class ModifyEvent extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      eventdata:{}
    }

    this.updateFormValues = this.updateFormValues.bind(this)
    this.updateFormToggle = this.updateFormToggle.bind(this)
    this.updateDateStart = this.updateDateStart.bind(this)
    this.updateDateEnd = this.updateDateEnd.bind(this)
    this.updatePriority = this.updatePriority.bind(this)

    this.sendBack = this.sendBack.bind(this)

  }

  componentDidMount(){
    if(this.props.createnew === false){
      request.get('/queryJSON')
      .query({
        type:"eventdetail",
        targetid:this.props.targetid
      })
      .end((err,data) => {
        console.log('event detail query finished', data.body.queryeventdetail)
        this.setState({eventdata:Object.assign(data.body.queryeventdetail)})
      })
    }else{
      this.setState({
        eventdata:{
          title:"",
          description:"",
          brief:"",
          datestart:moment(),
          dateend:moment(),
          enabled:true,
          eventid:this.props.targetid,
          image:"",
          link:"",
          priority:1,
        }
      })
    }
  }

  sendBack(e){
    e.preventDefault()
    this.setState({goback:true})
  }
  updateFormToggle(e, tgl){
    this.state.eventdata[e.target.name] = tgl
    this.forceUpdate()
  }

  updateFormValues(e){
    this.state.eventdata[e.target.name] = e.target.value
    this.forceUpdate()
  }

  updatePriority(e,index,value){
    console.log(value)
    this.state.eventdata.priority = value
    this.forceUpdate()
  }

  //parameter 'e' apparently doesn't work
  updateDateStart(e, date){
    this.state.eventdata.datestart = date
    console.log(date)
    this.forceUpdate()
  }
  updateDateEnd(e, date){
    this.state.eventdata.dateend = date
    console.log(date)
    this.forceUpdate()
  }

  render(){
    const updateFormValues = e =>this.updateFormValues(e)
    return (
      <div>
        편집중인 이벤트 번호: {this.props.targetid}
        <hr />
          <TextField floatingLabelText="이벤트 제목" value={this.state.eventdata.title} onChange={updateFormValues} name="title" fullWidth={true} /><br />
          <TextField floatingLabelText="짧은 설명" value={this.state.eventdata.brief} onChange={updateFormValues} name="brief" fullWidth={true} /><br />
          <TextField floatingLabelText="관련 웹페이지 주소" value={this.state.eventdata.link} onChange={updateFormValues} name="link" fullWidth={true} /><br />
          <TextField floatingLabelText="상세 설명(여러줄 입력 가능)" value={this.state.eventdata.description} onChange={updateFormValues} name="description" multiLine={true} fullWidth={true} /> <br/>

          <Toggle label="이벤트 표시(활성화)" name="enabled" onToggle={this.updateFormToggle} labelPosition="right" toggled={this.state.eventdata.enabled} /> <br />

          <DatePicker floatingLabelText="시작일자" name="datestart" value={new Date(moment(this.state.eventdata.datestart).format('YYYY-MM-DD'))} onChange={this.updateDateStart}  /> <br />
          <DatePicker floatingLabelText="종료일자" name="dateend" value={new Date(moment(this.state.eventdata.dateend).format('YYYY-MM-DD'))} onChange={this.updateDateEnd}  /> <br />
          <SelectField floatingLabelText="중요도(표시될 순서)" name="priority" value={this.state.eventdata.priority} onChange={this.updatePriority} autoWidth={true} >
            <MenuItem value={1} primaryText="매우 중요" />
            <MenuItem value={2} primaryText="중요" />
            <MenuItem value={3} primaryText="보통" />
            <MenuItem value={4} primaryText="안 중요함" />
          </SelectField><br />
        <hr />
        <RaisedButton label={this.props.createnew ? "등록" : "수정"} />
        {this.props.createnew ? null : <RaisedButton label="삭제" onClick={this.delete}/> }
        <RaisedButton label="취소" onClick={this.sendBack}/>
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
      </div>
    )
  }
}

//------------------- description edit page
class ModifyDesc extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      descdata:{}
    }
    this.sendBack = this.sendBack.bind(this)
  }

  sendBack(e){
    e.preventDefault()
    this.setState({goback:true})
  }

  render(){
    return (
      <div>
        편집중인 설명문 번호: {this.props.targetid}
        <hr />
        <hr />
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
        <RaisedButton label="취소" onClick={this.sendBack}/>
      </div>
    )
  }
}

ReactDOM.render(<AdminApp />,document.getElementById('root'))
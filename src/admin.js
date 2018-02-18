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
      adminToken:""
    }
    this.updateAuth = this.updateAuth.bind(this)
  }
  //TODO - Check if exact path='/' is right setting
  updateAuth(newId, newToken){
    console.log("token updated to", newToken)
    this.setState({adminId:newId, adminToken:newToken})
  }

  render(){
    return (
    <div>
    <Router>
      <div>
      <AdminNav id={this.state.adminId} />
      <Switch>
        <Route exact path='/admin' render={(props) => <AdminLogin updateAuth={this.updateAuth}/>} />
        <Route path='/admin/control' render={(props) => <AdminControl token={this.state.adminToken}/>} />
        <Route component={ WrongAccess } />
      </Switch>
      </div>
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
      <MuiThemeProvider>
      <div className={styles.loginwrap}>
        <div>
          <h3>스텔라마리나 관리자 페이지</h3>
          <TextField floatingLabelText="관리자명" name="userID" onChange={updateValues} onKeyPress={this.keyhandler} /><br />
          <TextField floatingLabelText="비밀번호" type="password" name="userPW" onChange={updateValues} onKeyPress={this.keyhandler}/><br />
          <RaisedButton label="로그인" onClick={this.loginAttempt} />
          {this.state.logged ? <Redirect to="/admin/control" /> : null }
        </div>
      </div>
      </MuiThemeProvider>
    )
  }
}


//----------------------------------------Main Control Page
class AdminControl extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      events:[],
      descs:[]
    }
    request.get('/queryEvents')
  }

  render(){
    return (
      <div>컨트롤페이지입니다</div>
    )
  }
}

ReactDOM.render(<AdminApp />,document.getElementById('root'))
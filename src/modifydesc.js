import React from 'react'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
import moment from 'moment'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import request from 'superagent'

//------------------- description edit page
export default class ModifyDesc extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      descdata:{
        title:"",
        context:"",
        dateedit:moment()
      }
    }
    this.sendBack = this.sendBack.bind(this)
    this.updateDescContext = this.updateDescContext.bind(this)
    this.confirmModify = this.confirmModify.bind(this)
  }

  sendBack(e){
    e.preventDefault()
    this.setState({goback:true})
  }

  componentDidMount(){
    console.log('loading up details...')
    request.get('/queryJSON')
    .query({
      type:"descdetail",
      targetid:this.props.targetid
    })
    .end((err,data)=>{
      console.log("detail data fetch completed:",data.body.querydescdetail)
      this.setState({descdata:data.body.querydescdetail})
    })
  }

  updateDescContext(e){
    this.state.descdata.context = e.target.value
    this.forceUpdate()
  }

  confirmModify(){
    this.state.descdata.dateedit = moment().format('YYYY-MM-DD')

    const params={
      targetid:this.props.targetid,
      type:'desc',
      createnew:this.props.createnew,
      token:this.props.token
    }

    const esc = encodeURIComponent
    let query = Object.keys(params)
    .map(k => esc(k) + '=' + esc(params[k]))
    .join('&')

    fetch('/modifydata?' + query,{
      method:'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(this.state.descdata)
    })
    .then((res)=>{
      if(res){
        alert('성공적으로 내용을 추가/갱신하였습니다')
        this.setState({goback:true})
      }
    })
    .catch((err,data)=>{

    })
  }

  render(){
    return (
      <div>
        편집중인 설명문 번호: {this.props.targetid}
        <hr />
          <div>{this.state.descdata.title}</div>
          <div>최종 편집일자: {moment(this.state.descdata.dateedit).format('YYYY-MM-DD')}</div>
          <TextField floatingLabelText="내용" value={this.state.descdata.context} onChange={this.updateDescContext} multiLine={true} fullWidth={true} />
        <hr />
        <RaisedButton label="수정" onClick={this.confirmModify} />
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
        <RaisedButton label="취소" onClick={this.sendBack}/>
      </div>
    )
  }
}


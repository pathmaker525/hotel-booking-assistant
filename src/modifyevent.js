import React from 'react'
import ReactDOM from 'react-dom'
import {BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
import moment from 'moment'
import request from 'superagent'

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import Toggle from 'material-ui/Toggle'
import DatePicker from 'material-ui/DatePicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Snackbar from 'material-ui/Snackbar'

import ImageUpload from './imageup.js'

//-------------------- event & promotion edit page
export default class ModifyEvent extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      eventdata:{
        title:"",
        description:"",
        brief:"",
        datestart:moment(),
        dateend:moment(),
        enabled:true,
        eventid:this.props.targetid,
        image:"",
        bannerimage:"",
        link:"",
        priority:1
      },
      fullimagedata:"",
      bannerimagedata:"",
      snackmsg:"업로드 완료",
      snackopen:false
    }

    this.updateFormValues = this.updateFormValues.bind(this)
    this.updateFormToggle = this.updateFormToggle.bind(this)
    this.updateDateStart = this.updateDateStart.bind(this)
    this.updateDateEnd = this.updateDateEnd.bind(this)
    this.updatePriority = this.updatePriority.bind(this)

    this.sendBack = this.sendBack.bind(this)

    this.confirmWrite = this.confirmWrite.bind(this)
    this._postimage = this._postimage.bind(this)
    this._postbannerimage = this._postbannerimage.bind(this)
    this.delete = this.delete.bind(this)
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

  confirmWrite(){
    this.state.eventdata.datestart = moment(this.state.eventdata.datestart).format('YYYY-MM-DD')
    this.state.eventdata.dateend = moment(this.state.eventdata.dateend).format('YYYY-MM-DD')
    console.log('try modify data', {targetid:this.props.targetid,type:'event',createnew:this.props.createnew,token:this.props.token,
                eventdata:this.state.eventdata})

    request.post('/modwimg')
    .query({
      token:this.props.token,
      targetid:this.props.targetid,
      createnew:this.props.createnew,
      type:'event'
    })
    .accept('application/json')
    .field('data',JSON.stringify(this.state.eventdata))
    .attach('image',this.state.fullimagedata)
    .attach('image',this.state.bannerimagedata)
    .then((res)=>{
      console.log('upload finished')
      this.setState({goback:true})
    })
    .catch((err)=>{

    })
  }

  delete(){
    request.get('/deleteevent')
    .query({
      targetid:this.props.targetid,
      token:this.props.token
    })
    .end((err,data)=>{
      if(data.body.result){
        alert('성공적으로 내용을 삭제했습니다')
        this.setState({goback:true})
      }
    })
  }

  _postimage(imgfile){
    console.log('image is set',imgfile)
    this.setState({fullimagedata:imgfile})
  }

  _postbannerimage(imgfile){
    console.log('banner is set',imgfile)
    this.setState({bannerimagedata:imgfile})
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
          배너 이미지(가로 800px 세로 400px)<ImageUpload postimage={this._postbannerimage} defaultimage={this.state.eventdata.bannerimage} /><br /><br />
          상세 이미지(가로사이즈 800px 이하권장)<ImageUpload postimage={this._postimage} defaultimage={this.state.eventdata.image}/>
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
        <RaisedButton label={this.props.createnew ? "등록" : "수정"} onClick={this.confirmWrite} />
        {this.props.createnew ? null : <RaisedButton label="삭제" onClick={this.delete}/> }
        <RaisedButton label="취소" onClick={this.sendBack}/>
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
        <Snackbar open={this.state.snackopen} message={this.state.snackmsg} autoHideDuration={4000} onRequestClose={this.handleRequestClose} />
      </div>
    )
  }
}


  
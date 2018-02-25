import React from 'react'
import ReactDOM from 'react-dom'
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {BrowserRouter as Router, Route, Link, Switch, Redirect } from 'react-router-dom'
import moment from 'moment'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import request from 'superagent'
import ImageUpload from './imageup.js'

//------------------- description edit page
export default class ModifyDesc extends React.Component {
  constructor(props){
    super(props)
    this.state={
      goback:false,
      descdata:{
        title:"",
        context:"",
        dateedit:moment(),
        category:0, // 0 - typical desc w/o image, 1 - typical desc w/image, 2 - sightseeing(with details) , 3 - gastronomy
        image:""
      },
      imagedata:""
    }
    this.sendBack = this.sendBack.bind(this)
    this.updateDescContext = this.updateDescContext.bind(this)
    this.confirmModify = this.confirmModify.bind(this)
    this.updateImage = this.updateImage.bind(this)
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

    request.post('/modwimg')
    .query({
      token:this.props.token,
      targetid:this.props.targetid,
      createnew:this.props.createnew,
      type:'desc'
    })
    .accept('application/json')
    .field('data',JSON.stringify(this.state.descdata))
    .attach('image',this.state.imagedata)
    .then((res)=>{
      console.log('upload finished')
      this.setState({goback:true})
    })
    .catch((err)=>{

    })

  }

  updateImage(imgfile){
    this.setState({imagedata:imgfile})
  }

  render(){
    return (
      <div>
        편집중인 설명문 번호: {this.props.targetid}
        <hr />
          <div>{this.state.descdata.title}</div>
          <div>최종 편집일자: {moment(this.state.descdata.dateedit).format('YYYY-MM-DD')}</div>
          {this.state.descdata.category > 0 ? <ImageUpload postimage={this.updateImage} defaultimage={this.state.descdata.image} /> : null}
          <div>편집 규칙: *제목(굵은글씨) -목록 >인용 @링크</div>
          <TextField floatingLabelText="내용" value={this.state.descdata.context} onChange={this.updateDescContext} multiLine={true} fullWidth={true} />
        <hr />
        <RaisedButton label="수정" onClick={this.confirmModify} />
        {this.state.goback ? <Redirect to="/admin/control" /> : null }
        <RaisedButton label="취소" onClick={this.sendBack}/>
      </div>
    )
  }
}


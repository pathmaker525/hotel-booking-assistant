import React from 'react'
import ReactDOM from 'react-dom'
//-------------------- image upload component
export default class ImageUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {imagePreviewUrl: ''}
  }

  _handleImageChange(e) {
    e.preventDefault()

    let reader = new FileReader()
    let file = e.target.files[0]

    reader.onloadend = () => {
      this.setState({
        file: file,
        imagePreviewUrl: reader.result
      });
    }

    reader.readAsDataURL(file)
    this.props.postimage(file)
  }

  render() {
    let {imagePreviewUrl} = this.state
    let $imagePreview = null
    if (imagePreviewUrl) {
      $imagePreview = (<img src={imagePreviewUrl} />)
    } else {
      if(this.props.defaultimage){
        $imagePreview = (<img src={'/pub/' + this.props.defaultimage} />)
      }else{
        $imagePreview = (<div className="previewText">이미지가 선택되지 않았습니다</div>)
      }
    }

    return (
      <div className="previewComponent">
        <form>
          <input className="fileInput" 
            type="file" 
            onChange={(e)=>this._handleImageChange(e)} />
        </form>
        <div className="imgPreview">
          {$imagePreview}
        </div>
      </div>
    )
  }
}
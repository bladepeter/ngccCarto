<template>
<div class="foxgis-data-cards">
  <mdl-snackbar display-on="mailSent"></mdl-snackbar>
  <div class="card" v-for='u in pageConfig.page_item_num' v-if="((pageConfig.current_page-1)*pageConfig.page_item_num+$index) < dataset.length" track-by="$index">
    <div class="name" @click="showDetails($event,dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].tileset_id)">
      <input type="text" maxlength="50" class="tileset-name" :value="dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].name" @change="uploadNameChange($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)"/>
      <mdl-anchor-button accent raised v-mdl-ripple-effect @click="downloadFile(dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].tileset_id)">下载</mdl-anchor-button>
    </div>

    <div class = "tags">
      <span>主题词:</span>
      <span class="tag" v-for="tag in dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].tags" track-by="$index">
        <span>{{ tag }}</span>
        <a title="删除标签" @click="deleteTag((pageConfig.current_page-1)*pageConfig.page_item_num+$parent.$index, $index)">×</a>
      </span>
      <input type="text" maxlength="10" @change="addTag($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)">
    </div>

    <div class="meta">
      <p>
      上传时间：<span style="width:200px;display: inline-block;">{{ dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].createdAt }}</span>
      共享范围：<select id="icon-scope" v-model="dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].scope" @change="editScope($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)">
          <option value="private">私有</option>
          <option value="public">公开</option>
        </select>
      <div>
        <mdl-anchor-button colored v-mdl-ripple-effect class="delete-button" @click="deleteUpload(dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].tileset_id)">删除</mdl-anchor-button>
      </div>
    </div>

    <div class="details">
      <div class="meta-container">
        <div class="meta-title title">
          <b>数据属性</b>
        </div>
        <div class="meta-data content">
            <span v-if="detailsData.center">中心：[{{detailsData.center[0]|currency '' 2 }},{{detailsData.center[1]|currency '' 2 }}]</span>
            <span>最大缩放级别：{{detailsData.maxzoom}}</span>
            <span v-if="detailsData.bounds">范围：[{{detailsData.bounds[0]|currency '' 2 }},{{detailsData.bounds[1]|currency '' 2 }},{{detailsData.bounds[2]|currency '' 2 }},{{detailsData.bounds[3]|currency '' 2 }}]</span>  
            <span>最小缩放级别：{{detailsData.minzoom}}</span>
            <span>格式：{{detailsData.format}}</span>
            <span>数据大小：{{calculation(detailsData.filesize)}}</span>
            <span style="width:600px;">访问地址：{{detailsData.url}}</span>
        </div>
      </div>
      <div class="description-container">
        <div class="description-title title">
          <b>数据描述</b>
        </div>
        <div class="description content">
          <mdl-textfield floating-label="介绍：" style="width:100%;" textarea rows="4" :value.sync="dataset[(pageConfig.current_page-1)*pageConfig.page_item_num+$index].description" @change="editDescription($event, (pageConfig.current_page-1)*pageConfig.page_item_num+$index)"></mdl-textfield>
        </div>
        
      </div>
      <div class="property-container">
        <div class="property-title title">
          <b>数据版权</b>
        </div>
        <div class="tileset-property content">
          <span>{{detailsData.attribution}}</span>
        </div>
      </div>
      <div class="preview-container" v-if="detailsData.vector_layers!=='undefined'">
        <div class="preview-title title">
          <b>图层信息</b>
        </div>
        <div class="preview content">
          <table>
            <tr>
              <th>id</th>
              <th>minzoom</th>
              <th>maxzoom</th>
              <th>fields</th>
              <th>description</th>
            </tr>
            <tr v-for="u in detailsData.vector_layers">
              <td>{{u.id}}</td>
              <td>{{u.minzoom}}</td>
              <td>{{u.maxzoom}}</td>
              <td style= "cursor:pointer;"><a v-on:click='lookFields(u.fields,$index)'>查看</a></td>
              <td>{{u.description}}</td>
            </tr>
          </table>
          <div class="fields" style="width: 380px;float: right;">
            <div class="field" v-for="(key,value) in fieldsData">{{key}}:{{value}}</div>
          </div>
        </div>
        
      </div>
    </div>
  </div>

  <div id="pagination" v-show="dataset.length>0?true:false">
    <ul>
      <li id="page-pre" disabled v-on:click="prePage" v-bind:class="pageConfig.current_page > 1?'':'disabled'">
        <span><i class="material-icons">navigate_before</i></span>
      </li>
      <li class="waves-effect" v-for="page in show_page_num"  v-bind:class="{ 'page-active': pageConfig.current_page == page + pageConfig.first_page}" v-on:click="setPage(page)"><span>{{ pageConfig.first_page + page }}</span></li>
      <li id="page-next" v-on:click="nextPage" v-bind:class="(total_items/pageConfig.page_item_num > 1)&&(pageConfig.current_page < parseInt(total_items/pageConfig.page_item_num)+1)?'':'disabled'">
        <span><i class="material-icons">navigate_next</i></span>
      </li>
    </ul>
  </div>

  <foxgis-dialog id="delete-dialog" class='modal' :dialog="dialogcontent" @dialog-action="deleteAction"></foxgis-dialog>
</div>
</template>


<script>
import Cookies from 'js-cookie'
export default {
  props: ['dataset'],
  methods: {
    showDetails: function (e,tileset_id) {
      let username = Cookies.get('username');
      if(username === undefined){
        return
      }
      let access_token = Cookies.get('access_token');
      let that = this;
      let url = SERVER_API.tilesets + '/' + username + '/' + tileset_id;
      //移除之前的active
      let activeCards = this.$el.querySelector('.active');
      if(activeCards&&activeCards!==e.target.parentElement){
        activeCards.className = activeCards.className.replace(' active','');
      }
      //给当前的dom添加active
      let claName = e.target.parentElement.className;
      if(claName.indexOf('active')!=-1){
        claName = claName.replace(' active','')
        e.target.parentElement.className = claName;
      }else{
        claName += ' active';
        //do somthing
        this.$http({ url: url, method: 'GET', headers: { 'x-access-token': access_token } }).then(function(response) {
            that.detailsData = response.data;
            that.detailsData.url = url;
            that.fieldsLength = response.data.vector_layers.length;
            that.fieldsData = [];
            e.target.parentElement.className = claName;
        }, function(response) {
          this.$broadcast('mailSent', { message: '数据集请求失败！',timeout:3000 });
          e.target.parentElement.className = claName;
        })
      }
  
    },

    lookFields:function(fields,index){
      this.fieldsData = fields;
      let height = (index-this.fieldsLength)*37;
      $('.fields').css("margin",height+'px'+' 0 0 420px')
    },

    calculation: function(size){//计算文件大小
      if (size / 1024 > 1024) {
        size = (size / 1048576).toFixed(2) + 'MB';
      } else {
        size = (size / 1024).toFixed(2) + 'KB';
      }
      return size;
    },

    uploadNameChange: function(e,index){//修改符号名称
      let value = e.target.value;
      let tileset_id = this.dataset[index].tileset_id;
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.tilesets + '/' + username + '/'+ tileset_id;
      this.dataset[index].name = value;
      this.$http({url:url,method:'PATCH',data:{'name':value},headers:{'x-access-token':access_token}})
        .then(function(response){
          let data = response.data;
          var input = $(".tileset-name");
          for(let i=0;i<input.length;i++){
            input[i].blur();
            input[i].value = this.dataset[i].name;
          }
        }, function(response) {
          alert("网络错误");
      });
    },
    editScope: function(e,index){//修改共享范围
        let scope = e.target.value;
        let username = Cookies.get('username');
        let access_token = Cookies.get('access_token');
        let tileset_id = this.dataset[index].tileset_id;
        let url = SERVER_API.tilesets + '/' + username + '/'+ tileset_id;
        this.$http({url:url,method:'PATCH',data:{'scope':scope},headers: { 'x-access-token': access_token }}).then(function(response){
  
          },function(response){
            alert("编辑错误");
          });
    },
    editDescription: function(e,index){//修改符号名称
      let value = e.target.value;
      let tileset_id = this.dataset[index].tileset_id;
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.tilesets + '/' + username + '/'+ tileset_id;
      this.dataset[index].description = value;
      this.$http({url:url,method:'PATCH',data:{'description':value},headers:{'x-access-token':access_token}})
        .then(function(response){
          let data = response.data;
          this.$broadcast('mailSent', { message: '修改成功！',timeout:3000 });
          /*var input = $(".tileset-name");
          for(let i=0;i<input.length;i++){
            input[i].blur();
            input[i].value = this.dataset[i].name;
          }*/
        }, function(response) {
          alert("网络错误");
      });
    },
    deleteTag: function(pId, tag_id) {
      let tags = this.dataset[pId].tags;
      let tileset_id = this.dataset[pId].tileset_id;
      tags.splice(tag_id, 1);
      let username = Cookies.get('username');
      let access_token = Cookies.get('access_token');
      let url = SERVER_API.tilesets + '/' + username + '/'+ tileset_id;
      this.$http({url:url,method:'PATCH',data:{'tags':tags},headers:{'x-access-token':access_token}})
        .then(function(response){
          if(response.ok){
          }
        }, function(response) {
          alert("网络错误");
      });
    },

    addTag: function(e, index) {
      if (e.target.value) {
        let tags = this.dataset[index].tags;
        let tileset_id = this.dataset[index].tileset_id;
        if(tags.indexOf(e.target.value)!=-1){
          alert('该标签已存在');
          return;
        }
        tags.push(e.target.value);
        e.target.value = '';
        let username = Cookies.get('username');
        let access_token = Cookies.get('access_token');
        let url = SERVER_API.tilesets + '/' + username + '/'+ tileset_id;
        this.$http({url:url,method:'PATCH',data:{'tags':tags},headers:{'x-access-token':access_token}})
         .then(function(response){
            if(response.ok){
            }
          }, function(response) {
            alert("网络错误");
        });
      }
    },
    deleteUpload: function(tileset_id) {
      this.dialogcontent.title = "确定删除吗？";
      this.$el.querySelector('#delete-dialog').style.display = 'block'
      this.deleteTilesetId = tileset_id
    },

    deleteAction: function(status) {
      if (status === 'ok') {
        let tileset_id = this.deleteTilesetId;
        let username = Cookies.get('username')
        let access_token = Cookies.get('access_token')
        let url = SERVER_API.tilesets + '/' + username + "/" + tileset_id
        this.$http({url:url,method:'DELETE',headers:{'x-access-token':access_token}})
        .then(function(response){
          if(response.ok){
            this.$dispatch("delete_tileset", tileset_id);
          }
        }, function(response) {
            alert('未知错误，请稍后再试')
        });
        this.deleteTilesetId = "";
      }
    },

    downloadFile: function(tileset_id) {
      let username = Cookies.get('username')
      let access_token = Cookies.get('access_token')
      let url = SERVER_API.tilesets + '/' + username + '/' + tileset_id + '/raw?access_token='+ access_token
      if((/Trident\/7\./).test(navigator.userAgent)||(/Trident\/6\./).test(navigator.userAgent)){
      //IE10/IE11
        var aLink = document.createElement('a')
        aLink.className = 'download_link'
        var text = document.createTextNode('&nbsp;')
        aLink.appendChild(text)
        aLink.href = url
        aLink.click()
      }else{//Chrome,Firefox
        var iframe = document.createElement("iframe");
        iframe.src = url;
        iframe.style = "display:none";
        document.body.appendChild(iframe);
      }
    },

    parseImgURL:function(upload) {
      
    },

    nextPage: function (event) {
      let allPages = Math.ceil(this.total_items / this.pageConfig.page_item_num)
      if(this.pageConfig.current_page === allPages){
        return
      }
      this.pageConfig.current_page += 1;

      if(this.pageConfig.current_page > this.show_page_num){
        this.pageConfig.first_page +=1;
      }
    },

    prePage: function (event) {
      if(this.pageConfig.current_page === 1){
        return
      }
      this.pageConfig.current_page -= 1;
      if(this.pageConfig.current_page < this.pageConfig.first_page){
        this.pageConfig.first_page -=1;
      }
    },

    setPage: function (page) {
      this.pageConfig.current_page = page+1;
    }
  },

  computed: {
     show_page_num: function (){
        let cop_page_num = Math.ceil(this.total_items / this.pageConfig.page_item_num);
        if(this.pageConfig.current_page > cop_page_num&&cop_page_num>0){
          this.pageConfig.current_page = cop_page_num;
        }
        return cop_page_num > 5 ? 5 : cop_page_num;
     },

     total_items: function (){
      let allCount = this.$parent.dataset.length;
      let count = this.dataset.length;
      this.$dispatch("tileset_nums", allCount);
      return count;
     }
   },

  data(){
    return {
      pageConfig: {
        page_item_num: 10,         //每页显示的条数
        current_page: 1,
        first_page: 1,
      },
      dialogcontent: {
        title: '确定删除吗？',
        textOk:'删除',
        textCancel:'取消'
      },
      deleteTilesetId: "",
      detailsData: {},
      fieldsData: [],
      fieldsLength: 0//被点击的卡片的field的总个数
    }
  }
}

</script>


<style scoped>


.card {
/*  height: 120px;*/
  border-radius: 2px 2px 0 0;
  transform: translatez(0);
  background: #fff;
  box-shadow: 0 1px 2px rgba(0,0,0,.12);
  outline: none;
  overflow: hidden;
  transition: .2s;
}

.card+.card {
  margin-top: 1px;
}

.card:focus, .card:hover {
  box-shadow: 0 4px 4px rgba(0,0,0,.12);
  margin: 12px -12px;
}

.card .name {
  margin: 24px 24px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-align: left;
  cursor: pointer;
}

.name input {
  font-size: 16px;
  margin: 0;
  border: none;
  padding: 5px 5px 5px 0;
  width: 360px;
  transition: 0.2s;
}

.small-pic {
  float: left;
  height: 100px;
  width: 100px;
  margin: 15px 10px;
  transition: all 0.5s;
}

.small-pic:hover {
  opacity: 0.7;
}

.small-pic img {
  border-radius: 5px;
  max-width:100%;
  height:auto; 
}
.card .meta {
  margin: 5px 24px;
  font-size: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.active .meta {
  display: none;
}

.active .tags{
  margin-top: 12px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
  font-size: 16px;
  transition: 0.2s;
}

.active .name input {
  font-size: 24px;
  transition:0.2s;
} 

.details{
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  padding: 0;
  transition: .3s;
}

.active .details{
  max-height: 4000px;
  opacity: 1;
  transition:0.5s;
}

.foxgis-data-cards .card.active {
  box-shadow: 0 4px 4px rgba(0,0,0,.12);
  margin: 24px -24px;
}

.title{
  margin:12px 35px;
}
.content{
  margin:16px 50px 16px 50px; 
}

.preview-container{
  margin-bottom:40px; 
}

.tags {
  margin-left: 24px;
  margin-right: 24px;
  font-size: 13px;
  transition: 0.2s;
}

.tags input {
  outline: none;
  border: 0;
}

.tag {
  background: #eee;
  color: #333;
  text-decoration: none;
  cursor: pointer;
  margin: 0 3px;
  vertical-align: middle;
  padding: 5px;
  border-radius: 12px;
}

.tag a {
    text-decoration: none;
    margin-left: 5px;
    font: 14px "Times New Roman";
}
.meta p {
  color: #9E9E9E;
  font-size: 12px;
  margin: 0;
}

.meta .mdl-button {
  text-align: right;
  min-width: 0;
  padding: 0 12px;
}
#pagination {
  text-align: center;
  display: block;
}

#pagination li.disabled {
  color: #9c9696;
}

#pagination .material-icons {
  vertical-align: middle;
}

#pagination ul {
  padding: 10px;
  display: inline-block;
}

#pagination li {
  display: inline-block;
  margin: 0 10px;
  list-style-type: disc;
  cursor: pointer;
  width: 30px;
}

#pagination li:not(.page-active):hover {
  background-color: #eaa5bd;
  font-weight: bold;
}

#pagination li.page-active {
  background-color: #ff4081;
  font-weight: bolder;
}

#pagination li span {
  padding: 6px;
  line-height: 30px;
  font-size: 1.2em;
}

#page-pre {
  margin-right: 10px;
}

#page-next {
  margin-left: 10px;
  vertical-align: middle;
}
.modal {
  position: fixed;
  left: 240px;
  right: 0px;
  top:0px;
  bottom: 0px;
  margin: 0 auto;
  padding-bottom: 20px;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  z-index: 9999;
  overflow: auto;
}

.delete-button{
  position: relative;
  left: -18px;
}

.preview-container table {
  font-family: verdana,arial,sans-serif;
  font-size:11px;
  color:#333333;
  border-width: 1px;
  border-color: #666666;
  border-collapse: collapse;
}
.preview-container table th {
  border-width: 1px;
  padding: 8px;
  border-style: solid;
  border-color: #666666;
  background-color: #dedede;
}
.preview-container table td {
  border-width: 1px;
  padding: 8px;
  border-style: solid;
  border-color: #666666;
  background-color: #ffffff;
}

.preview-container div.fields {
  display: flex;
  flex-wrap:wrap;
  margin-left:45px; 
}

.preview-container div.field {
  border:1px solid #333333;
  margin:5px;
  padding:5px;
  font-family:verdana,arial,sans-serif;
  font-size:11px;
  color:#333333;
}

.meta-container div.meta-data {
  display: flex;
  flex-wrap: wrap;
}

.meta-container div.meta-data span {
  width:300px;
}
</style>

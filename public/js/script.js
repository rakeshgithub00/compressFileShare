// require('dotenv').config();

class BinaryHeap {

    constructor() {
        this.heap = [];
    }

    insert(value) {
        this.heap.push(value);
        this.bubbleUp();
    }

    size() {
        return this.heap.length;
    }

    empty(){
        return ( this.size()===0 );
    }

    //using iterative approach
    bubbleUp() {
        let index = this.size() - 1;

        while (index > 0) {
            let element = this.heap[index],
                parentIndex = Math.floor((index - 1) / 2),
                parent = this.heap[parentIndex];

            if (parent[0] >= element[0]) break;
            this.heap[index] = parent;
            this.heap[parentIndex] = element;
            index = parentIndex
        }
    }

    extractMax() {
        const max = this.heap[0];
        const tmp = this.heap.pop();
        if(!this.empty()) {
            this.heap[0] = tmp;
            this.sinkDown(0);
        }
        return max;
    }

    sinkDown(index) {

        let left = 2 * index + 1,
            right = 2 * index + 2,
            largest = index;
        const length = this.size();

        // console.log(this.heap[left], left, length, this.heap[right], right, length, this.heap[largest]);

        if (left < length && this.heap[left][0] > this.heap[largest][0]) {
            largest = left
        }
        if (right < length && this.heap[right][0] > this.heap[largest][0]) {
            largest = right
        }
        // swap
        if (largest !== index) {
            let tmp = this.heap[largest];
            this.heap[largest] = this.heap[index];
            this.heap[index] = tmp;
            this.sinkDown(largest)
        }
    }
}


class HuffmanCoder{

    stringify(node){
        if(typeof(node[1])==="string"){
            return '\''+node[1];
        }

        return '0' + this.stringify(node[1][0]) + '1' + this.stringify(node[1][1]);
    }

    display(node, modify, index=1){
        if(modify){
            node = ['',node];
            if(node[1].length===1)
                node[1] = node[1][0];
        }

        if(typeof(node[1])==="string"){
            return String(index) + " = " + node[1];
        }

        let left = this.display(node[1][0], modify, index*2);
        let right = this.display(node[1][1], modify, index*2+1);
        let res = String(index*2)+" <= "+index+" => "+String(index*2+1);
        return res + '\n' + left + '\n' + right;
    }

    destringify(data){
        let node = [];
        if(data[this.ind]==='\''){
            this.ind++;
            node.push(data[this.ind]);
            this.ind++;
            return node;
        }

        this.ind++;
        let left = this.destringify(data);
        node.push(left);
        this.ind++;
        let right = this.destringify(data);
        node.push(right);

        return node;
    }

    getMappings(node, path){
        if(typeof(node[1])==="string"){
            this.mappings[node[1]] = path;
            return;
        }

        this.getMappings(node[1][0], path+"0");
        this.getMappings(node[1][1], path+"1");
    }

    encode(data){

        this.heap = new BinaryHeap();

        const mp = new Map();
        for(let i=0;i<data.length;i++){
            if(data[i] in mp){
                mp[data[i]] = mp[data[i]] + 1;
            } else{
                mp[data[i]] = 1;
            }
        }

        for(const key in mp){
            this.heap.insert([-mp[key], key]);
        }

        while(this.heap.size() > 1){
            const node1 = this.heap.extractMax();
            const node2 = this.heap.extractMax();

            const node = [node1[0]+node2[0],[node1,node2]];
            this.heap.insert(node);
        }
        const huffman_encoder = this.heap.extractMax();

        this.mappings = {};
        this.getMappings(huffman_encoder, "");

        let binary_string = "";
        for(let i=0;i<data.length;i++) {
            binary_string = binary_string + this.mappings[data[i]];
        }

        let rem = (8 - binary_string.length%8)%8;
        let padding = "";
        for(let i=0;i<rem;i++)
            padding = padding + "0";
        binary_string = binary_string + padding;

        let result = "";
        for(let i=0;i<binary_string.length;i+=8){
            let num = 0;
            for(let j=0;j<8;j++){
                num = num*2 + (binary_string[i+j]-"0");
            }
            result = result + String.fromCharCode(num);
        }

        let final_res = this.stringify(huffman_encoder) + '\n' + rem + '\n' + result;
        let info = "Compression Ratio : " + data.length/final_res.length;
        info = "Compression complete and file sent for download" + '\n' + info;
        return [final_res, this.display(huffman_encoder, false), info];
    }

    decode(data){
        data = data.split('\n');
        if(data.length===4){
            // Handling new line
            data[0] = data[0] + '\n' + data[1];
            data[1] = data[2];
            data[2] = data[3];
            data.pop();
        }

        this.ind = 0;
        const huffman_decoder = this.destringify(data[0]);
        const text = data[2];

        let binary_string = "";
        for(let i=0;i<text.length;i++){
            let num = text[i].charCodeAt(0);
            let bin = "";
            for(let j=0;j<8;j++){
                bin = num%2 + bin;
                num = Math.floor(num/2);
            }
            binary_string = binary_string + bin;
        }
        binary_string = binary_string.substring(0,binary_string.length-data[1]);

        console.log(binary_string.length);

        let res = "";
        let node = huffman_decoder;
        for(let i=0;i<binary_string.length;i++){
            if(binary_string[i]==='0'){
                node = node[0];
            } else{
                node = node[1];
            }

            if(typeof(node[0])==="string"){
                res += node[0];
                node = huffman_decoder;
            }
        }
        let info = "Decompression complete and file sent for download";
        return [res, this.display(huffman_decoder, true), info];
    }
}
// import {
//     HuffmanCoder
// } from './huffman.js';

function decDownload(req) {
    const coder = new HuffmanCoder();
    const xhr = new XMLHttpRequest();
    console.log(req);
    xhr.onload = function () {

        // Process our return data
        if (xhr.status >= 200 && xhr.status < 300) {
            // Runs when the request is successful 
            //xhr response always return string even if they sent json obj
            var obj = JSON.parse(xhr.responseText);
            console.log(obj.data);
            let [decoded, tree_structure, info] = coder.decode(obj.data);
            downloadFile('decoded.txt', decoded);            
        } else {
            // Runs when it's not
            console.log(xhr.responseText);
        }
    
    };

    xhr.open('GET', req);
    xhr.send();
}

onload = function () {
    // Get reference to elements
    const treearea = document.getElementById('treearea');
    const encode = document.getElementById('encode');
    const decode = document.getElementById('decode');
    const temptext = document.getElementById('temptext');
    const upload = document.getElementById('uploadedFile');

    const sharingContainer = document.getElementsByClassName("sharing-container");
    const copyURLBtn = document.getElementById("copyURLBtn");
    const fileshare = document.getElementById('fileshare');
    const fileURL = document.getElementById('fileURL');

    //const toast = document.querySelector(".toast");

    fileshare.onclick = function (req) 
    {
        const uploadedFile = upload.files[0];
        //console.log(uploadedFile);
        if (uploadedFile === undefined) {
            alert("No file uploaded !");
            return;
        }
        else
        {
            const fileReader = new FileReader();
            fileReader.onload = function (fileLoadedEvent) 
            {
            const text = fileLoadedEvent.target.result;
            if (text.length === 0) {
                alert("Text can not be empty ! Upload another file !");
                return;
            }
            let [encoded, tree_structure, info] = coder.encode(text);  
            const file = new Blob([encoded], {type: 'text/plain'});  
            const formData = new FormData();
            formData.append("myfile", file);
            const xhr = new XMLHttpRequest();
            
            xhr.upload.onerror = function () {
                console.log(`Error in upload: ${xhr.status}.`);
                upload.value = ""; // reset the input
              };

            xhr.onreadystatechange = function () {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    console.log(xhr.responseText);
                    upload.value = ""; // reset the input 
                    const { file: url } = JSON.parse(xhr.responseText);
                    console.log(url);
                    //sharingContainer.style.display = "block";
                    fileURL.value = url;
                }
              };
            //   `${process.env.APP_BASE_URL}/api/files`
            xhr.open("POST", "http://localhost:3000/api/files");
            xhr.send(formData);
            };

            fileReader.readAsText(uploadedFile, "UTF-8");
        }
    };

    const coder = new HuffmanCoder();

    upload.addEventListener('change', () => {
        alert("File uploaded")
    });

    copyURLBtn.addEventListener("click", () => {
        fileURL.select();
        document.execCommand("copy");
        // showToast("Copied to clipboard");
    });
      
    fileURL.addEventListener("click", () => {
        fileURL.select();
    });

    let toastTimer;
    // the toast function
    const showToast = (msg) => {
    clearTimeout(toastTimer);
    toast.innerText = msg;
    toast.classList.add("show");
    toastTimer = setTimeout(() => {
    toast.classList.remove("show");
    }, 2000);
};

    const uploadFile = () => {
        console.log("file added uploading");
      
        let files = upload.files;
        const formData = new FormData();
        formData.append("myfile", files[0]);
      
        //show the uploader
        //progressContainer.style.display = "block";
      
        // upload file
        const xhr = new XMLHttpRequest();
      
        // handle error
        xhr.upload.onerror = function () {
          console.log(`Error in upload: ${xhr.status}.`);
          upload.value = ""; // reset the input
        };
      
        // listen for response which will give the link
        xhr.onreadystatechange = function () {
          if (xhr.readyState == XMLHttpRequest.DONE) {
              console.log(xhr.responseText);
            // onFileUploadSuccess(xhr.responseText);
          }
        };
      
        xhr.open("POST", "http://localhost:3000/api/files");
        xhr.send(formData);
      };


    encode.onclick = function () {

        const uploadedFile = upload.files[0];
        if (uploadedFile === undefined) {
            alert("No file uploaded !");
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            const text = fileLoadedEvent.target.result;
            if (text.length === 0) {
                alert("Text can not be empty ! Upload another file !");
                return;
            }
            let [encoded, tree_structure, info] = coder.encode(text);
            downloadFile(uploadedFile.name.split('.')[0] + '_encoded.txt', encoded);
            treearea.innerText = tree_structure;
            treearea.style.marginTop = '2000px';
            temptext.innerText = info;
        };
        fileReader.readAsText(uploadedFile, "UTF-8");
    };


    decode.onclick = function () {

        const uploadedFile = upload.files[0];
        if (uploadedFile === undefined) {
            alert("No file uploaded !");
            return;
        }
        const fileReader = new FileReader();
        fileReader.onload = function (fileLoadedEvent) {
            const text = fileLoadedEvent.target.result;
            if (text.length === 0) {
                alert("Text can not be empty ! Upload another file !");
                return;
            }
            let [decoded, tree_structure, info] = coder.decode(text);
            downloadFile(uploadedFile.name.split('.')[0] + '_decoded.txt', decoded);
            treearea.innerText = tree_structure;
            treearea.style.marginTop = '2000px';
            temptext.innerText = info;
        };
        fileReader.readAsText(uploadedFile, "UTF-8");
    };

};

function downloadFile(fileName, data) {
    let a = document.createElement('a');
    a.href = "data:application/octet-stream," + encodeURIComponent(data);
    a.download = fileName;
    a.click();
}

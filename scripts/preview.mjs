// Local-only UI harness. No remote service calls, credentials, or production deployment.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
const root=resolve('dist');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'};
createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/api/intake'){
    let data='';for await(const chunk of req)data+=chunk;
    const body=JSON.parse(data||'{}');
    const fail=body.description?.includes('[simulate error]');
    res.writeHead(fail?502:200,{'Content-Type':'application/json'});res.end(JSON.stringify({ok:!fail}));return;
  }
  let path=resolve(root,'.'+decodeURIComponent(url.pathname));
  if(!path.startsWith(root+'/')&&path!==root){res.writeHead(403);res.end();return}
  if(!extname(path))path+='/index.html';
  try{const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});res.end(body)}catch{res.writeHead(404);res.end(await readFile(root+'/404.html'))}
}).listen(4174,'127.0.0.1',()=>console.log('UI harness http://127.0.0.1:4174 — mocked inquiry only'));

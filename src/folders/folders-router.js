const path = require('path');
const express = require('express');
const xss = require('xss'); 
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = (folder) => ({
  id: folder.id,
  name: xss(folder.name),
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders =>{
        res.json(folders.map(serializeFolder));
      })
      console.log(res.body)
      .catch(next); 
  })
  .post(jsonParser, (req, res, next) => {
    const { name } = req.body;
    const newName = { name }; 
    if(!newName){
      return res.status(400).json({
        error: { message: 'Missing folder name in request' } 
      });
    }
    
    FoldersService.insertFolder(
      req.app.get('db'),
      newName
    )
      .then(folder => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(serializeFolder(folder));
      })
      console.log(res.body)
      .catch(next); 
  });

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    FoldersService.getFolderById(
      req.app.get('db'),
      req.param.folder_id
    )
      .then (folder =>{
        if (!folder){
          return res.status(404).json({
            error: {message: 'Folder doesn\'t exist'}
          });
        }
        res.folder = folder;
        next();  
      })
      console.log(res.body)
      .catch(next); 
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req,res,next) => {
    FoldersService.deleteFolder(
      req.app.get('db'),
      req.params.folder_id
    )
      .then( () =>{
        res.status(204).end();
      })
      console.log(res.body)
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { newName } = req.body;
    if(!newName) {
      return res.status(400).json({
        error: {
          message: 'Request must have a folder name'
        }
      });
    }
    FoldersService.updateFolder(
      req.app.get('db'),
      req.params.folder_id,
      name
    )
      .then( () => {
        res.status(204).end(); 
      })
      console.log(res.body)
      .catch(next); 
  });

module.exports = foldersRouter;
{
  "publishAsJSGlobal": false,
    "toJSON": true,
      "extraProperties": {
    "version": "2",
      "classes": {
      "Document": {
        "panelColor": "#548DD4",
          "panel": {
          "isOpen": "true",
            "pathVisible": true,
              "position": {
            "X": 107,
              "Y": 33
          }
        }
      },
      "Group": {
        "panelColor": "#7F7F7F",
          "panel": {
          "isOpen": "true",
            "pathVisible": true,
              "position": {
            "X": 446,
              "Y": 44
          }
        }
      },
      "Owner": {
        "panelColor": "#E5B9B7",
          "panel": {
          "isOpen": "true",
            "pathVisible": true,
              "position": {
            "X": 431,
              "Y": 309
          }
        }
      }
    },
    "model": {
      "scriptMode": "manual",
        "workspaceLeft": 0,
          "workspaceTop": 0,
            "lastScriptLocation": {
        "Document": {
          "method": "Document/Document-methods.js"
        },
        "Group": {
          "computed": "Group/Group-events.js"
        },
        "Owner": {
          "computed": "Owner/Owner-events.js"
        }
      }
    }
  },
  "dataClasses": [
    {
      "name": "Document",
      "className": "Document",
      "collectionName": "DocumentCollection",
      "scope": "public",
      "attributes": [
        {
          "name": "ID",
          "kind": "storage",
          "scope": "public",
          "unique": true,
          "autosequence": true,
          "type": "long",
          "primKey": true
        },
        {
          "name": "name",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "number",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "revision",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "outputDate",
          "kind": "storage",
          "scope": "public",
          "type": "date",
          "simpleDate": true
        },
        {
          "name": "inputDate",
          "kind": "storage",
          "scope": "public",
          "type": "date",
          "simpleDate": true
        },
        {
          "name": "normFilePath",
          "kind": "storage",
          "matchColumn": "normFile",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "group",
          "kind": "relatedEntity",
          "matchColumn": "groupId",
          "scope": "public",
          "type": "Group",
          "path": "Group"
        },
        {
          "name": "owner",
          "kind": "relatedEntity",
          "matchColumn": "ownerId",
          "scope": "public",
          "type": "Owner",
          "path": "Owner"
        },
        {
          "name": "groupName",
          "kind": "alias",
          "scope": "public",
          "type": "string",
          "path": "group.name"
        }
      ]
    },
    {
      "name": "Group",
      "className": "Group",
      "collectionName": "GroupCollection",
      "scope": "public",
      "attributes": [
        {
          "name": "ID",
          "kind": "storage",
          "scope": "public",
          "unique": true,
          "autosequence": true,
          "type": "long",
          "primKey": true
        },
        {
          "name": "name",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "documents",
          "kind": "relatedEntities",
          "matchColumn": "documentCollection",
          "scope": "public",
          "type": "DocumentCollection",
          "reversePath": true,
          "path": "group"
        },
        {
          "name": "newName",
          "kind": "calculated",
          "scope": "public",
          "type": "string",
          "scriptKind": "javascript",
          "onGet": [
            {
              "from": "$mainModel.Group.newName.onGet",
              "userDefined": true
            }
          ]
        }
      ]
    },
    {
      "name": "Owner",
      "className": "Owner",
      "collectionName": "OwnerCollection",
      "matchTable": "Owner",
      "scope": "public",
      "attributes": [
        {
          "name": "ID",
          "kind": "storage",
          "scope": "public",
          "unique": true,
          "autosequence": true,
          "type": "long",
          "primKey": true
        },
        {
          "name": "firstName",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "lastName",
          "kind": "storage",
          "scope": "public",
          "type": "string"
        },
        {
          "name": "fullName",
          "kind": "calculated",
          "scope": "public",
          "type": "string",
          "scriptKind": "javascript",
          "onGet": [
            {
              "from": "$mainModel.Owner.fullName.onGet",
              "userDefined": true
            }
          ]
        }
      ],
      "publishAsJSGlobal": true
    }
  ]
}

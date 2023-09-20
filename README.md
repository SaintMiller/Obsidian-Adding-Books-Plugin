# Obsidian Adding Book Plugin
This plagin helps me to archive my books by categories. 
Simple way to create notes with data into obsidian.

> For start work find Settings and add folder path.

## Template note
```markdown
---
tag: 📚Book
tags: [{{tags}}]
title: "{{title}}"
author: [{{author}}]
publisher: {{publisher}}
publish: {{publishDate}}
total: {{totalPage}}
isbn: {{isbn10}} {{isbn13}}
cover: {{coverUrl}}
status: {{status}}
created: {{DATE:YYYY-MM-DD HH:mm:ss}}
updated: {{DATE:YYYY-MM-DD HH:mm:ss}}
extension: {{extension}}
filename: {{filename}}
fileHash: {{fileHash256}}
---

![cover|150]({{coverUrl}})

# {{title}}
#📚Book 

*Reference*
```


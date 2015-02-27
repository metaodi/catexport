catexport
=========

The aims of this projects are GLAM institutions that provide their data to the Wikimedia Commons projects and want to extract the categorization done by the community in a structured way. This tool uses the API of Wikimedia Commons in the background. It generates CSV with the following format

```
filename,category
```

If a file has multiple categories, there will be multiple entries for it. The first column acts as a unique identifier of the file.

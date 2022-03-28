import { Client } from "@notionhq/client";

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

export const getDatabase = async (databaseId) => {
  const response = await notion.databases.query({
    database_id: databaseId,
  });
  var result = response.results.filter((obj, index) => {
    return obj.properties !== undefined;
  });
  return response.results;
};

export const getData = async (databaseId, startCursor = undefined) => {
  const response = await notion.databases.query({
    database_id: databaseId,
    start_cursor: startCursor,
  });

  return response;
}

export const getAllDatabase = async (databaseId) => {
  let keepFetching = false;
  let nextCursor;
  let finalData = [];
  const response = await getData(databaseId);
  finalData.push(...response.results);
  if(response.has_more){
    nextCursor = response.next_cursor;
    keepFetching = true;
  }
  else{
    keepFetching = false;
  }
  while(keepFetching){
    const responseMore = await getData(databaseId, nextCursor);
    finalData.push(...responseMore.results)
    keepFetching = responseMore.has_more;
    nextCursor = responseMore.next_cursor;
  }
  console.log(finalData.length);
  return finalData;
};

export const getPage = async (pageId) => {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
};

export const getBlocks = async (blockId) => {
  const response = await notion.blocks.children.list({
    block_id: blockId,
    page_size: 50,
  });
  return response.results;
};

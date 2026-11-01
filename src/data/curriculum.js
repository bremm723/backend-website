import http from "./curriculum/http";
import node from "./curriculum/node";
import rest from "./curriculum/rest";
import db from "./curriculum/db";
import auth from "./curriculum/auth";
import quality from "./curriculum/quality";
import ops from "./curriculum/ops";
import capstone from "./curriculum/capstone";

export const QUIZ_TOPICS = [http, node, rest, db, auth, quality, ops, capstone];

export const getTopicById = (id) => QUIZ_TOPICS.find((topic) => topic.id === id);

export default QUIZ_TOPICS;

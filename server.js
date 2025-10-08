import express from "express";
import fs from "fs";
import cors from "cors";
import path from "path";

const app = express();
app.use(cors());
app.use(express.json());

const TODOS_FILE = path.join(process.cwd(), "data", "todos.json");


const readTodos = () => {
  if (!fs.existsSync(TODOS_FILE)) return [];
  const data = fs.readFileSync(TODOS_FILE, "utf-8");
  return data ? JSON.parse(data) : [];
};


const writeTodos = (todos, skipTimerReset = false) => {
  fs.writeFileSync(TODOS_FILE, JSON.stringify(todos, null, 2));
  if (!skipTimerReset) resetAutoDeleteTimer();
};

let deleteTimer = null;

const resetAutoDeleteTimer = () => {
  if (deleteTimer) clearTimeout(deleteTimer);
  deleteTimer = setTimeout(() => {
    console.log("🗑️ تمام todos حذف شدند (بعد از 1 دقیقه)");
    writeTodos([], true);
  }, 60000); 
};


app.get("/todos", (req, res) => {
  const todos = readTodos();
  res.json(todos);
});

app.post("/todos", (req, res) => {
  const todos = readTodos();
  const newTodo = { id: Date.now(), text: req.body.text, completed: false };
  todos.push(newTodo);
  writeTodos(todos);
  res.json(newTodo);
});

app.delete("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  let todos = readTodos();
  todos = todos.filter((t) => t.id !== id);
  writeTodos(todos);
  res.json({ success: true });
});


app.put("/todos/:id", (req, res) => {
  const id = Number(req.params.id);
  const todos = readTodos();
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.completed = req.body.completed;
    writeTodos(todos);
    res.json(todo);
  } else {
    res.status(404).json({ error: "Not found" });
  }
});


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  resetAutoDeleteTimer(); 
});

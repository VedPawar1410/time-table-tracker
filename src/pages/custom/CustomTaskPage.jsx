import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { getCustomTasks } from "../../lib/db.js";
import { GenericTaskPage } from "../GenericTaskPage.jsx";
import { FONTS, THEME } from "../../lib/constants.js";

export default function CustomTaskPage() {
  const { key } = useParams();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getCustomTasks(user.id).then(tasks => {
      setTask(tasks.find(t => t.task_key === key) || null);
      setLoading(false);
    });
  }, [user?.id, key]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: THEME.inkFaint, fontFamily: FONTS.mono, fontSize: 12 }}>Loading...</div>;
  if (!task) return <div style={{ padding: 40, textAlign: "center", color: THEME.inkMuted }}>Task not found.</div>;

  return (
    <GenericTaskPage
      taskId={task.task_key}
      title={task.label}
      icon={task.icon}
      subtitle="Custom tracked task"
      accentColor={task.color_tx}
    />
  );
}

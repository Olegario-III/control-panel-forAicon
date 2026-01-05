import React from "react";

export default function ExamResult() {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Exam Results</h2>
      <p style={styles.subtitle}>
        Below are the results of the intern exam. Please review carefully.
      </p>

      <div style={styles.iframeWrapper}>
        <iframe
          src="https://docs.google.com/spreadsheets/d/1LU7reVO5oS_AVnhmDHtaqZ1iilUgNH6g57-ky6on2Yg/edit?usp=sharing"
          width="100%"
          height="800"
          frameBorder="0"
          title="Exam Results"
        >
          Loading…
        </iframe>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    background: "#020617",
    color: "#e5e7eb",
    minHeight: "100vh",
  },
  title: {
    fontSize: "1.5rem",
    marginBottom: "5px",
  },
  subtitle: {
    fontSize: "0.9rem",
    color: "#9ca3af",
    marginBottom: "15px",
  },
  iframeWrapper: {
    background: "#0f172a",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1f2937",
  },
};

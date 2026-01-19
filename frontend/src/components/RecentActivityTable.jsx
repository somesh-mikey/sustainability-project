export default function RecentActivityTable({ data }) {
  if (!data.length) {
    return <p className="muted">No recent activity</p>;
  }

  return (
    <table className="activity-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            <td>{row.date}</td>
            <td>{row.action}</td>
            <td>{row.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

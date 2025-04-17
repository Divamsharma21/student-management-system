import Link from "next/link"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">School Management System</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Student Module</h2>
        <p className="mb-4">
          Manage student records including adding, retrieving, updating, and deleting student details.
        </p>
        <Link href="/students" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Go to Student Management
        </Link>
      </div>
    </div>
  )
}

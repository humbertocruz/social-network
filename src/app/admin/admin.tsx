'use client'

import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, Search, Plus } from "lucide-react";
import Image from 'next/image';

const AdminDashboardClient = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="container mx-auto p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Admin Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="images">Images</TabsTrigger>
                <TabsTrigger value="events">Events</TabsTrigger>
              </TabsList>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add New
                </Button>
              </div>
            </div>

            <TabsContent value="users">
              <UsersTable />
            </TabsContent>
            <TabsContent value="posts">
              <PostsTable />
            </TabsContent>
            <TabsContent value="images">
              <ImagesTable />
            </TabsContent>
            <TabsContent value="events">
              <EventsTable />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

const UsersTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Username</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {/* Replace with actual data mapping */}
        <TableRow>
          <TableCell>johndoe</TableCell>
          <TableCell>john@example.com</TableCell>
          <TableCell>FREE</TableCell>
          <TableCell>{new Date().toLocaleDateString()}</TableCell>
          <TableCell>
            <ActionMenu onEdit={() => {}} onDelete={() => {}} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

const PostsTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Content</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Images</TableHead>
          <TableHead>Created At</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="max-w-md truncate">Post content here...</TableCell>
          <TableCell>johndoe</TableCell>
          <TableCell>2 images</TableCell>
          <TableCell>{new Date().toLocaleDateString()}</TableCell>
          <TableCell>
            <ActionMenu onEdit={() => {}} onDelete={() => {}} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

const ImagesTable = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {/* Replace with actual data mapping */}
      <Card>
        <CardContent className="p-4">
          <Image
            width={300}
            height={200}
            src="/api/placeholder/300/200"
            alt="Gallery image"
            className="rounded-lg w-full h-32 object-cover mb-2"
          />
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {new Date().toLocaleDateString()}
            </span>
            <ActionMenu onEdit={() => {}} onDelete={() => {}} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const EventsTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Created By</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Event Title</TableCell>
          <TableCell className="max-w-md truncate">Event description...</TableCell>
          <TableCell>{new Date().toLocaleDateString()}</TableCell>
          <TableCell>johndoe</TableCell>
          <TableCell>
            <ActionMenu onEdit={() => {}} onDelete={() => {}} />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

const ActionMenu = ({ onEdit, onDelete }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onEdit}>Edit</DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="text-red-600"
        >
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AdminDashboardClient

class node:
   def __init__(self,val,neigh=[]):
      self.val=val
      self.neigh=neigh
      self.visited_right=False
      self.visited_left=False
      self.parent_right=None
      self.parent_left=None

from collections import deque

def bidirectional(s,t):
   def extract_path(node):
      node_copy=node
      path=[]
      while node:
         path.append(node.val)
         node=node.parent_right
      path.reverse()  
      del path[-1] 
      while node_copy:
         path.append(node_copy.val)
         node_copy=node_copy.parent_left

      return path
   
   q=deque([])
   q.append(s)
   q.append(t)
   s.visited_right=True
   t.visited_left=True
   while len(q)>0:
      n=q.pop()
      if n.visited_left and n.visited_right:
         return extract_path(n)
      for node in n.neigh:
         if n.visited_left==True and not node.visited_left:
            node.parent_left=n
            node.visited_left=True
            q.append(node)
         if n.visited_right==True and not node.visited_right:
            node.parent_right=n
            node.visited_right=True
            q.append(node)
   return False
           
n0 = node(0)
n1 = node(1)
n2 = node(2)
n3 = node(3)
n4 = node(4)
n5 = node(5)
n6 = node(6)
n7 = node(7)
n0.neigh = [n1, n5]
n1.neigh = [n0, n2, n6]
n2.neigh = [n1]
n3.neigh= [n4, n6]
n4.neigh = [n3]
n5.neigh = [n0, n6]
n6.neigh = [n1, n3, n5, n7]
n7.neigh= [n6]
print(bidirectional(n0, n4))

   
      


   